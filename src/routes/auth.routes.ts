// src/routes/auth.routes.ts
import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const authRouter = Router();
const authController = new AuthController();

// Ruta para el registro de usuarios
// POST /auth/register
authRouter.post("/register", authController.register);

// Aquí irá la ruta para el login más adelante
// router.post('/login', authController.login);

export default authRouter;
