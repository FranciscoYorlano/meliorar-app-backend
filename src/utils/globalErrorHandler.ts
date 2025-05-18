import { Request, Response, NextFunction } from 'express';
import { HttpException } from './HttpException';
import { errorResponse } from './response';
import {
  authMessages,
  errorMessages,
  validationMessages,
} from './bug_tracking/bug_tracking.messages';
import { MessageAPI } from './bug_tracking/bug_tracking.types';

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction // _next para indicar que no se usa, pero es parte de la firma
) => {
  let messageToUse: MessageAPI = { ...errorMessages.UNKNOWN_EXCEPTION }; // Clonamos y default
  const errorForLogging: string | null =
    err.stack ||
    err.message ||
    String(err) ||
    'Error desconocido sin stack ni mensaje.';
  const dynamicDataForMessage: any = {}; // Por ahora vacío, necesitarías poblarlo si tus HttpException lo proveen

  if (err instanceof HttpException) {
    let foundMatchingMessage = false;

    // Mapeo simple basado en status. Podría mejorarse con códigos de error específicos en HttpException.
    switch (err.status) {
      case 400:
        messageToUse = {
          ...validationMessages.INVALID_ATTRIBUTE_TYPE,
          status: err.status,
          description: err.message,
        };
        foundMatchingMessage = true;
        break;
      case 401:
        messageToUse = {
          ...authMessages.UNAUTHORIZED,
          status: err.status,
          description: err.message,
        };
        foundMatchingMessage = true;
        break;
      case 404:
        // El manejador 404 en app.ts ya llama a errorResponse, así que este caso
        // sería para HttpExceptions con status 404 lanzadas desde otros lugares.
        messageToUse = {
          ...errorMessages.NOT_FOUND,
          status: err.status,
          description: err.message,
        };
        foundMatchingMessage = true;
        break;
      case 409:
        messageToUse = {
          ...validationMessages.DUPLICATE_VALUE,
          status: err.status,
          description: err.message,
        };
        foundMatchingMessage = true;
        break;
    }

    if (!foundMatchingMessage) {
      // Si no hay un MessageAPI predefinido que coincida por status,
      // creamos uno genérico a partir de HttpException.
      messageToUse = {
        code: `HTTP_ERROR_${err.status}`,
        status: err.status,
        component: err.name || 'HttpException',
        description: err.message,
      };
    }
    // Considerar si HttpException debería llevar 'dynamicData'
    // dynamicDataForMessage = err.dynamicData || {};
  }
  // Si no es HttpException, messageToUse sigue siendo UNKNOWN_EXCEPTION.

  errorResponse(res, messageToUse, errorForLogging, dynamicDataForMessage);
};
