// src/modules/profitability-settings/profitability-settings.controller.ts
import { NextFunction, Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ProfitabilitySettingsService } from './profitability-settings.service';
import { UpdateProfitabilitySettingsDto } from './profitability-settings.dto';
import { HttpException } from '../../utils/HttpException';
import { successResponse } from '../../utils/response';

export class ProfitabilitySettingsController {
  private settingsService = new ProfitabilitySettingsService();

  public getSettings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const appUserId = req.user?.userId;
      if (!appUserId) throw new HttpException(401, 'Usuario no autenticado.');

      const settingsEntity =
        await this.settingsService.getProfitabilitySettings(appUserId);
      if (settingsEntity) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { user, ...settingsData } = settingsEntity; // Excluir el campo 'user'
        successResponse(res, 200, settingsData);
      } else {
        successResponse(res, 200, {}); // O los defaults si el servicio los crea y devuelve
      }
    } catch (error) {
      next(error);
    }
  };

  public updateSettings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const appUserId = req.user?.userId;
      if (!appUserId) throw new HttpException(401, 'Usuario no autenticado.');

      const dto = plainToInstance(
        UpdateProfitabilitySettingsDto,
        req.body || {}
      );
      const errors = await validate(dto, { skipMissingProperties: true }); // skipMissingProperties porque es un PATCH/PUT parcial

      if (errors.length > 0) {
        const message = errors
          .map((error) => Object.values(error.constraints || {}))
          .join(', ');
        throw new HttpException(
          400,
          message || 'Error de validación en la entrada.'
        );
      }

      const updatedSettings =
        await this.settingsService.updateProfitabilitySettings(appUserId, dto);
      successResponse(res, 200, updatedSettings);
    } catch (error) {
      next(error);
    }
  };
}
