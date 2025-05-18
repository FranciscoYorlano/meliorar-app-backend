import { Router } from 'express';
import userRouter from '../modules/user/users.router';

const apiRouter = Router();

apiRouter.use('/users', userRouter);

export default apiRouter;
