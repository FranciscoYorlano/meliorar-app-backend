// src/routes/user.routes.ts
import { Router, Request, Response, NextFunction } from 'express';

const userRouter = Router();

// Ruta GET /api/users/profile (protegida)
userRouter.get(
  '/profile',
  (req: Request, res: Response, next: NextFunction) => {
    // Si llegamos aquí, authMiddleware verificó el token y añadió req.user
    try {
      // req.user fue añadido por authMiddleware y contiene el payload del token
      const userProfile = req.user;

      if (!userProfile) {
        // Esto no debería pasar si authMiddleware funciona bien, pero es una doble verificación
        return next(
          new Error(
            'Información de usuario no encontrada después de la autenticación.'
          )
        );
      }

      // Podrías querer buscar más datos del usuario en la BD usando userProfile.userId
      // pero por ahora, solo devolvemos el payload del token.
      res.status(200).json({
        message: 'Perfil del usuario obtenido exitosamente',
        data: userProfile,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default userRouter;
