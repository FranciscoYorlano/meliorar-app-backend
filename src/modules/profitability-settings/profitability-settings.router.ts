// src/modules/profitability-settings/profitability-settings.router.ts
import { Router } from 'express';
import { ProfitabilitySettingsController } from './profitability-settings.controller';
import { authMiddleware } from '../auth/auth.middleware';

const settingsRouter = Router();
const settingsController = new ProfitabilitySettingsController();

// GET /api/v1/profitability-settings/
settingsRouter.get('/', settingsController.getSettings);

settingsRouter.put('/', settingsController.updateSettings);

export default settingsRouter;
