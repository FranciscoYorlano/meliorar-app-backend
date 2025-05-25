import { Router } from 'express';
import userRouter from '../modules/user/users.router';
import meliRouter from '../modules/meli/meli.router';
import costsRouter from '../modules/costs/costs.router';
import { authMiddleware } from '../modules/auth/auth.middleware';

const apiRouter = Router();

apiRouter.use('/users', authMiddleware, userRouter);
apiRouter.use('/meli', meliRouter);
apiRouter.use('/costs', authMiddleware, costsRouter);

export default apiRouter;
