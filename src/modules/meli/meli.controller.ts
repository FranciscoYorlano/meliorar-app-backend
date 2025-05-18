// src/modules/meli/meli.controller.ts
import { Request, Response, NextFunction } from 'express';
import { config } from '../../config/appConfig';
import { HttpException } from '../../utils/HttpException';
import { MeliService } from './meli.service';
// Asumimos que AuthTokenPayload está correctamente definida y exportada desde auth.middleware.ts
// y que tu typings/express/index.d.ts la usa para extender req.user
// import { AuthTokenPayload } from '../auth/auth.middleware';

export class MeliController {
  private meliService: MeliService;
  constructor() {
    // Inyectar MeliService si es necesario en el futuro
    this.meliService = new MeliService();
  }

  public redirectToMeliAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (
        !config.meli ||
        !config.meli.appId ||
        !config.meli.redirectUri ||
        !config.meli.authUrl
      ) {
        console.error(
          'MELI_CONTROLLER: Falta configuración de Mercado Libre en appConfig.ts:',
          config.meli
        );
        throw new HttpException(
          500,
          'La configuración de Mercado Libre no está completa en el servidor.'
        );
      }

      // req.user es añadido por tu auth.middleware.ts
      const appUserId = req.user?.userId; // Asumiendo que tu AuthTokenPayload tiene userId

      if (!appUserId) {
        // Esto no debería ocurrir si authMiddleware funciona correctamente
        throw new HttpException(
          401,
          'Usuario no autenticado para iniciar la conexión con Mercado Libre.'
        );
      }

      // El parámetro 'state' es para seguridad y para re-asociar el callback.
      // Usamos el ID del usuario de tu aplicación. MELI te lo devolverá.
      const state = appUserId;

      const meliAuthUrlBuilder = new URL(config.meli.authUrl);
      meliAuthUrlBuilder.searchParams.append('response_type', 'code');
      meliAuthUrlBuilder.searchParams.append('client_id', config.meli.appId);
      meliAuthUrlBuilder.searchParams.append(
        'redirect_uri',
        config.meli.redirectUri
      );
      meliAuthUrlBuilder.searchParams.append('state', state);

      const meliAuthUrl = meliAuthUrlBuilder.toString();

      console.log(
        `MELI_CONTROLLER: Redirigiendo usuario ${appUserId} a: ${meliAuthUrl}`
      );
      res.redirect(meliAuthUrl); // HTTP 302 Redirect
    } catch (error) {
      next(error);
    }
  };

  public handleMeliCallback = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { code, error, error_description, state } = req.query;

      console.log('MELI_CALLBACK: Query params recibidos:', req.query);

      const appUserIdFromJwt = req.user?.userId;
      if (!appUserIdFromJwt) {
        throw new HttpException(
          401,
          'Usuario no autenticado en el callback de MELI.'
        );
      }

      // Validar el 'state' para seguridad CSRF y para confirmar el usuario
      if (!state || state !== appUserIdFromJwt) {
        console.warn(
          `MELI_CALLBACK: Discrepancia en state. Recibido: ${state}, Esperado para JWT user: ${appUserIdFromJwt}`
        );
        throw new HttpException(
          400,
          'Parámetro state inválido o ausente, o no coincide con el usuario.'
        );
      }
      console.log(
        `MELI_CALLBACK: State recibido y validado: ${state} para usuario: ${appUserIdFromJwt}`
      );

      if (error) {
        console.error(
          `MELI_CALLBACK: Error de Mercado Libre: ${error} - ${error_description || ''}`
        );
        // TODO: Redirigir a una página de error en el frontend con un mensaje amigable
        // Por ahora, enviamos un error JSON
        throw new HttpException(
          400, // O un código de error de MELI si está disponible y es relevante
          `Error de Mercado Libre: ${error_description || error}`
        );
      }

      if (!code || typeof code !== 'string') {
        throw new HttpException(
          400,
          'No se recibió el código de autorización de Mercado Libre o es inválido.'
        );
      }

      console.log(
        `MELI_CALLBACK: Código de autorización de MELI recibido: ${code} para el usuario ${appUserIdFromJwt}`
      );

      // Intercambiar código por tokens y guardar en el usuario
      const updatedUser = await this.meliService.exchangeCodeForTokens(
        code,
        appUserIdFromJwt
      );

      // TODO: Redirigir al usuario a una página de éxito en tu frontend.
      // Ejemplo: res.redirect('https://tufrontend.com/meli-conectado-exitosamente');
      // Por ahora, enviamos una respuesta JSON de éxito.
      res.status(200).json({
        message: '¡Cuenta de Mercado Libre conectada exitosamente!',
        user: updatedUser, // Contiene los datos del usuario de tu app (sin tokens MELI ni hash)
      });
    } catch (error) {
      next(error);
    }
  };
}
