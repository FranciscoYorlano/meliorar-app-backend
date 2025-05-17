// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { UserService } from "../services/user.service";
import { CreateUserDto } from "../dtos/create-user.dto";
import { LoginUserDto } from "../dtos/login-user.dto";
import { config } from "../config/appConfig";
import { HttpException } from "../utils/HttpException";
import * as jwt from "jsonwebtoken";
import { SignOptions } from "jsonwebtoken";

export class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requestBody = req.body || {};

      // 1. Convertir el cuerpo de la solicitud (JSON plano) a una instancia de nuestro DTO
      const createUserDto = plainToInstance(CreateUserDto, requestBody);

      // 2. Validar el DTO
      const errors = await validate(createUserDto);

      if (errors.length > 0) {
        // Formatear los errores para una mejor respuesta
        const message = errors
          .map((error) => Object.values(error.constraints || {}))
          .join(", ");
        // Pasamos el error al siguiente middleware (nuestro manejador de errores global)
        next(
          new HttpException(400, message || "Error de validación en la entrada")
        );
        return;
      }

      // 3. Llamar al servicio para crear el usuario
      const newUser = await this.userService.createUser(createUserDto);

      // 4. Enviar respuesta exitosa
      res.status(201).json({
        message: "Usuario registrado exitosamente",
        user: newUser, // newUser ya no tiene el password_hash
      });
    } catch (error) {
      // Pasamos cualquier otro error al manejador de errores global
      next(error);
    }
  };

  public login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requestBody = req.body || {};
      const loginUserDto = plainToInstance(LoginUserDto, requestBody);
      const errors = await validate(loginUserDto);

      if (errors.length > 0) {
        const message = errors
          .map((error) => Object.values(error.constraints || {}))
          .join(", ");
        next(
          new HttpException(400, message || "Error de validación en la entrada")
        );
        return;
      }

      // Llamar al servicio para validar las credenciales y obtener el usuario
      const user = await this.userService.loginUser(loginUserDto);

      const tokenPayload = {
        userId: user.id,
        email: user.email,
      };

      const token = jwt.sign(tokenPayload, config.jwt.secret, {
        expiresIn: "1d",
      });

      res.status(200).json({
        message: "Inicio de sesión exitoso",
        user,
        token,
      });
    } catch (error) {
      console.error("Error en AuthController login:", error);
      next(error);
    }
  };
}
