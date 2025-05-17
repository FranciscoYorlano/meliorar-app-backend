import { Repository } from "typeorm";
import bcrypt from "bcryptjs";
import AppDataSource from "../config/dataSource"; // Nuestra fuente de datos
import { User } from "../entities/user.entity";
import { CreateUserDto } from "../dtos/create-user.dto";
import { HttpException } from "../utils/HttpException";

export class UserService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    const { email, password } = userData;

    // 1. Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      // Es importante no dar demasiada info sobre si el email existe o no por seguridad,
      // pero para desarrollo inicial o un error más específico podríamos ser claros.
      // Para producción, un mensaje genérico como "Credenciales inválidas" o "Error al registrar" puede ser mejor
      // al intentar loguear o registrar con un email ya existente.
      // Aquí, como es un registro, seremos claros.
      throw new HttpException(409, "El correo electrónico ya está registrado.");
    }

    // 2. Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10); // El 10 es el "salt rounds"

    // 3. Crear la nueva instancia de usuario
    const newUser = this.userRepository.create({
      email,
      password_hash: hashedPassword,
    });

    // 4. Guardar el usuario en la base de datos
    try {
      await this.userRepository.save(newUser);
    } catch (error) {
      // Podrías loggear el error 'error' para depuración interna
      throw new HttpException(500, "Ocurrió un error al crear el usuario.");
    }

    // No devolvemos el password_hash en la respuesta por seguridad
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = newUser;
    return userWithoutPassword as User;
  }

  // Aquí irán otros métodos (getUserById, getUserByEmail, etc.) más adelante
}
