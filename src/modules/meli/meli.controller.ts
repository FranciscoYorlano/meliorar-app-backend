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
      meliAuthUrlBuilder.searchParams.append(
        'scope',
        'read write offline_access'
      );
      meliAuthUrlBuilder.searchParams.append('state', state);

      const meliAuthUrl = meliAuthUrlBuilder.toString();

      console.log(
        `MELI_CONTROLLER: Redirigiendo usuario ${appUserId} a: ${meliAuthUrl}`
      );

      console.log('--- Datos para la URL de autorización de MELI ---');
      console.log('Auth URL Base:', config.meli.authUrl);
      console.log('Client ID:', config.meli.appId);
      console.log('Redirect URI:', config.meli.redirectUri);
      console.log('State:', state);
      console.log('URL Completa Generada:', meliAuthUrl);
      // También puedes loguear req.user para asegurarte de que está presente
      console.log('req.user:', req.user);

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

      const appUserIdFromState = state as string;
      if (!appUserIdFromState) {
        throw new HttpException(
          401,
          'Usuario no autenticado en el callback de MELI.'
        );
      }

      console.log(
        `MELI_CALLBACK: State recibido y validado: ${state} para usuario: ${appUserIdFromState}`
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
        `MELI_CALLBACK: Código de autorización de MELI recibido: ${code} para el usuario ${appUserIdFromState}`
      );

      // Intercambiar código por tokens y guardar en el usuario
      const updatedUser = await this.meliService.exchangeCodeForTokens(
        code,
        appUserIdFromState
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

  public getUserPublications = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const appUserId = req.user?.userId; // Viene del authMiddleware que protegerá esta ruta
      if (!appUserId) {
        // Esto no debería pasar si authMiddleware está bien configurado para esta ruta
        throw new HttpException(401, 'Usuario no autenticado.');
      }

      console.log(
        `MELI_CONTROLLER: Solicitud para obtener publicaciones del usuario ${appUserId}`
      );
      const publications =
        await this.meliService.fetchAndSaveUserPublications(appUserId);

      res.status(200).json({
        message: `${publications.length} publicaciones obtenidas y sincronizadas exitosamente.`,
        count: publications.length,
        data: publications, // Puedes decidir qué devolver aquí
      });
    } catch (error) {
      next(error);
    }
  };
}
