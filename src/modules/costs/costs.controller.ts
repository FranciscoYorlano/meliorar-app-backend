// src/modules/costs/costs.controller.ts
import { NextFunction, Request, Response } from 'express';
import { CostsService } from './costs.service';
import { HttpException } from '../../utils/HttpException';
import { successResponse } from '../../utils/response';

export class CostsController {
  private costsService = new CostsService();

  public uploadCostsExcel = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const appUserId = req.user?.userId;
      if (!appUserId) {
        // Esto no debería pasar si authMiddleware está bien configurado
        throw new HttpException(401, 'Usuario no autenticado.');
      }

      if (!req.file) {
        throw new HttpException(400, 'No se recibió ningún archivo.');
      }

      const fileBuffer = req.file.buffer;
      const processingResult = await this.costsService.processCostExcel(
        fileBuffer,
        appUserId
      );

      successResponse(res, 200, processingResult);
    } catch (error) {
      next(error);
    }
  };
}
