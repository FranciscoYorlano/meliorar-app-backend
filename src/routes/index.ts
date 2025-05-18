import { Router } from 'express';
import { authMiddleware } from '../modules/auth/auth.middleware';
import authRouter from '../modules/auth/auth.router';
import apiRouter from './api.router';

const router = Router();

router.use('/api/v1', authMiddleware, apiRouter);
router.use('/auth', authRouter);

export default router;
