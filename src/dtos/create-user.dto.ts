// src/dtos/create-user.dto.ts
import { IsEmail, IsNotEmpty, MinLength, MaxLength } from "class-validator";

export class CreateUserDto {
  @IsEmail({}, { message: "El correo electrónico proporcionado no es válido." })
  @IsNotEmpty({ message: "El correo electrónico no puede estar vacío." })
  email!: string;

  @IsNotEmpty({ message: "La contraseña no puede estar vacía." })
  @MinLength(8, { message: "La contraseña debe tener al menos 8 caracteres." })
  @MaxLength(50, {
    message: "La contraseña no puede tener más de 20 caracteres.",
  })
  // Podrías añadir @Matches para requerir mayúsculas, números, etc. si quieres más complejidad.
  password!: string;
}
