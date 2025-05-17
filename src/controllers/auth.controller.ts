// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { UserService } from "../services/user.service";
import { CreateUserDto } from "../dtos/create-user.dto";
import { HttpException } from "../utils/HttpException";

export class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // Hacemos el método de instancia una propiedad de función de flecha para mantener el 'this' correcto
  // o usamos .bind(this) al pasar el método al router. La función de flecha es más limpia aquí.
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

  // Aquí irá el método login más adelante
  // public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => { ... }
}
