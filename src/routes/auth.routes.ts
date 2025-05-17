// src/routes/auth.routes.ts
import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const authRouter = Router();
const authController = new AuthController();

// POST /auth/register
authRouter.post("/register", authController.register);

// POST /auth/login
authRouter.post("/login", authController.login);

export default authRouter;
