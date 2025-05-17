// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { config } from "../config/appConfig";
import { HttpException } from "../utils/HttpException";

// Definimos una interfaz para el payload de nuestro token para tener mejor tipado
export interface AuthTokenPayload extends JwtPayload {
  userId: string;
  email: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(
        new HttpException(
          401,
          "Token de autorización no proporcionado o con formato incorrecto."
        )
      );
    }

    const token = authHeader.split(" ")[1]; // Obtenemos el token después de "Bearer "

    if (!token) {
      return next(
        new HttpException(401, "Token de autorización no proporcionado.")
      );
    }

    const decodedPayload = jwt.verify(
      token,
      config.jwt.secret as Secret
    ) as AuthTokenPayload;

    // Si el token es válido, adjuntamos el payload decodificado (que contiene userId, email) a req.user
    // Para que TypeScript no se queje de 'user' en 'req', necesitamos extender la interfaz Request (ver Paso 3b)
    req.user = decodedPayload; // Usamos 'as any' temporalmente si no hemos extendido Request globalmente

    next(); // Pasamos al siguiente manejador (el controlador de la ruta protegida)
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      // Esto incluye TokenExpiredError, NotBeforeError, etc.
      return next(new HttpException(401, "Token inválido o expirado."));
    }
    // Para otros errores inesperados durante la verificación
    return next(
      new HttpException(500, "Error interno al autenticar el token.")
    );
  }
};
