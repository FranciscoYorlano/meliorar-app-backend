import { Response } from 'express';
import { bugTrackingGenerator } from './bug_tracking/bug_tracking.functions';
import { MessageAPI } from './bug_tracking/bug_tracking.types';
import { replaceDynamicData } from './global';

/**
 * successResponse
 * @param res Response
 * @param status number
 * @param body any
 */
export const successResponse = (
  res: Response,
  status: number,
  body: any
): void => {
  res.status(status).json(body);
};

/**
 * errorResponse
 * @param res Response
 * @param message MessageAPI
 * @param errorString string
 * @param data data para remplazar los campos dinamicos del mensaje
 */
export const errorResponse = (
  res: Response,
  messageAPI: MessageAPI,
  errorString: string | null,
  data?: any
): void => {
  /**
   * Replace description MessageAPI
   */
  const description: string = replaceDynamicData(messageAPI.description, data);

  messageAPI = {
    ...messageAPI,
    description,
  };

  /**
   * Set errorString if exist
   */

  res.status(messageAPI.status).json(messageAPI);

  bugTrackingGenerator(messageAPI, errorString);
};
