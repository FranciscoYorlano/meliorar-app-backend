import { Router, Request, Response, NextFunction } from 'express';
import { MeliController } from './meli.controller';
import { authMiddleware } from '../auth/auth.middleware';

const meliRouter = Router();
const meliController = new MeliController();

meliRouter.get('/connect', authMiddleware, meliController.redirectToMeliAuth);

meliRouter.get(
  '/publications',
  authMiddleware,
  meliController.getUserPublications
);

meliRouter.get('/callback', meliController.handleMeliCallback);

export default meliRouter;
