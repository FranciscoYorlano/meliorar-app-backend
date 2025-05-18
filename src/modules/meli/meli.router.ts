import { Router, Request, Response, NextFunction } from 'express';
import { MeliController } from './meli.controller';

const meliRouter = Router();
const meliController = new MeliController();

meliRouter.get('/connect', meliController.redirectToMeliAuth);

meliRouter.get('/callback', meliController.handleMeliCallback);

export default meliRouter;
