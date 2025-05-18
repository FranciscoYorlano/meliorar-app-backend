import { Router } from 'express';
import userRouter from '../modules/user/users.router';
import meliRouter from '../modules/meli/meli.router';

const apiRouter = Router();

apiRouter.use('/users', userRouter);
apiRouter.use('/meli', meliRouter);

export default apiRouter;
