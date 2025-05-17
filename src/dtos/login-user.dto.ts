import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class LoginUserDto {
  @IsEmail(
    {},
    { message: "El correo electrónico proporcionado no es válido o falta." }
  )
  @IsNotEmpty({ message: "El correo electrónico no puede estar vacío." })
  email!: string;

  @IsNotEmpty({ message: "La contraseña no puede estar vacía." })
  password!: string;
}
