// src/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from './auth.controller';

const authRouter = Router();
const authController = new AuthController();

// POST /auth/register
authRouter.post('/signup', authController.signup);

// POST /auth/login
authRouter.post('/signin', authController.signin);

export default authRouter;
