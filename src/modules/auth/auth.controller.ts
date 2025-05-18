// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UserService } from '../user/user.service';
import { SignInUserDto, SignUpUserDto } from './auth.dto';
import { config } from '../../config/appConfig';
import { HttpException } from '../../utils/HttpException';
import * as jwt from 'jsonwebtoken';
import { successResponse } from '../../utils/response';
import { Secret, SignOptions } from 'jsonwebtoken';

export class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public signup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requestBody = req.body || {};

      const createUserDto = plainToInstance(SignUpUserDto, requestBody);

      const errors = await validate(createUserDto);
      if (errors.length > 0) {
        const message = errors
          .map((error) => Object.values(error.constraints || {}))
          .join(', ');
        next(
          new HttpException(400, message || 'Error de validación en la entrada')
        );
        return;
      }

      const newUser = await this.userService.createUser(createUserDto);

      return successResponse(res, 201, newUser);
    } catch (error) {
      next(error);
    }
  };

  public signin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requestBody = req.body || {};

      const loginUserDto = plainToInstance(SignInUserDto, requestBody);

      const errors = await validate(loginUserDto);
      if (errors.length > 0) {
        const message = errors
          .map((error) => Object.values(error.constraints || {}))
          .join(', ');
        next(
          new HttpException(400, message || 'Error de validación en la entrada')
        );
        return;
      }

      const user = await this.userService.loginUser(loginUserDto);

      const tokenPayload = {
        userId: user.id,
        email: user.email,
      };

      // ---- SOLUCION PRAGMATICA A TIPADO DE EXPIRESIN ----
      const currentExpiresIn = config.jwt.expiresIn;

      const token = jwt.sign(tokenPayload, config.jwt.secret, {
        expiresIn: currentExpiresIn as any,
      });

      return successResponse(res, 200, { user, token });
    } catch (error) {
      console.error('Error en AuthController login:', error);
      next(error);
    }
  };
}
