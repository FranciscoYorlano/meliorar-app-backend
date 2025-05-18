// src/modules/meli/meli.service.ts
import axios from 'axios';
import { config } from '../../config/appConfig';
import { User } from '../user/user.entity'; // Importa tu entidad User
import AppDataSource from '../../config/dataSource'; // Tu fuente de datos
import { HttpException } from '../../utils/HttpException'; // Para manejar errores

// Interfaz para la respuesta del token de MELI (basada en su documentación)
interface MeliTokenResponse {
  access_token: string;
  token_type: string; // suele ser "bearer"
  expires_in: number; // Duración en segundos
  scope: string;
  user_id: number; // El ID del usuario en MELI
  refresh_token: string;
}

export class MeliService {
  private userRepository = AppDataSource.getRepository(User);

  constructor() {}

  public async exchangeCodeForTokens(
    authCode: string,
    appUserId: string
  ): Promise<User> {
    if (
      !config.meli.appId ||
      !config.meli.clientSecret ||
      !config.meli.redirectUri ||
      !config.meli.tokenUrl
    ) {
      console.error(
        'MELI_SERVICE: Falta configuración crítica de MELI para el intercambio de tokens.'
      );
      throw new HttpException(
        500,
        'Error de configuración del servidor para la integración con MELI.'
      );
    }

    const tokenUrl = config.meli.tokenUrl;
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', config.meli.appId);
    params.append('client_secret', config.meli.clientSecret);
    params.append('code', authCode);
    params.append('redirect_uri', config.meli.redirectUri);

    try {
      console.log(
        'MELI_SERVICE: Solicitando tokens a MELI con code:',
        authCode
      );
      const response = await axios.post<MeliTokenResponse>(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
      });

      const tokenData = response.data;
      console.log('MELI_SERVICE: Tokens recibidos de MELI:', tokenData);

      // Buscar el usuario de tu aplicación para guardar los tokens
      const user = await this.userRepository.findOneBy({ id: appUserId });
      if (!user) {
        throw new HttpException(
          404,
          `Usuario de la aplicación con ID ${appUserId} no encontrado.`
        );
      }

      // Calcular la fecha de expiración del token de acceso
      const expiresInMilliseconds = tokenData.expires_in * 1000;
      const expiresAt = new Date(Date.now() + expiresInMilliseconds);

      // Actualizar la entidad User con los datos de MELI
      user.meli_user_id = tokenData.user_id;
      user.meli_access_token = tokenData.access_token; // TODO: Encriptar antes de guardar
      user.meli_refresh_token = tokenData.refresh_token; // TODO: Encriptar antes de guardar
      user.meli_token_expires_at = expiresAt;
      user.meli_last_sync_at = new Date(); // Opcional, o puedes poner una fecha específica para la conexión inicial

      await this.userRepository.save(user);
      console.log(
        `MELI_SERVICE: Tokens de MELI guardados para el usuario ${appUserId} (MELI User ID: ${tokenData.user_id})`
      );

      // Devolvemos el usuario actualizado (sin el hash de contraseña ni los tokens MELI si no queremos exponerlos directamente)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {
        password_hash,
        meli_access_token,
        meli_refresh_token,
        ...userToReturn
      } = user;
      return userToReturn as User; // O un DTO específico
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        console.error(
          'MELI_SERVICE: Error al intercambiar código por token con MELI:',
          error.response.data
        );
        throw new HttpException(
          error.response.status || 500,
          `Error de MELI al intercambiar token: ${error.response.data.message || error.response.data.error || 'Error desconocido'}`
        );
      }
      console.error(
        'MELI_SERVICE: Error inesperado al intercambiar código por token:',
        error
      );
      throw new HttpException(
        500,
        'Error interno al procesar la autorización de Mercado Libre.'
      );
    }
  }
}
