// src/modules/costs/costs.router.ts
import { Router } from 'express';
import { CostsController } from './costs.controller';
import upload from '../../config/multerConfig'; // Importar multer config
import { authMiddleware } from '../auth/auth.middleware'; // Asumiendo que esta ruta debe estar protegida

const costsRouter = Router();
const costsController = new CostsController();

// POST /api/v1/costs/upload-excel
costsRouter.post(
  '/upload-excel',
  upload.single('excelFile'), // 'excelFile' es el nombre del campo en el form-data
  costsController.uploadCostsExcel
);

export default costsRouter;
