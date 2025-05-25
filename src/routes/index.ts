import { Router } from 'express';
import authRouter from '../modules/auth/auth.router';
import apiRouter from './api.router';

const router = Router();

router.use('/api/v1', apiRouter);
router.use('/auth', authRouter);

export default router;
