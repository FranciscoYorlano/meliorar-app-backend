import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('users') // Define el nombre de la tabla en la base de datos como 'users'
@Unique(['email']) // Crea una restricción UNIQUE en la columna 'email'
export class User {
  @PrimaryGeneratedColumn('uuid') // Define 'id' como llave primaria auto-generada (UUID)
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  email!: string;

  @Column({ type: 'varchar', nullable: false })
  password_hash!: string; // Almacenaremos la contraseña hasheada

  /*
    @Column({ type: 'varchar', nullable: true })
    meli_user_id: string | null;

    @Column({ type: 'text', nullable: true }) // 'text' para tokens que pueden ser largos
    meli_access_token: string | null;

    @Column({ type: 'text', nullable: true })
    meli_refresh_token: string | null;

    @Column({ type: 'timestamp', nullable: true })
    meli_token_expires_at: Date | null;
    */

  @CreateDateColumn({ type: 'timestamp with time zone' }) // Se establece automáticamente al crear
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' }) // Se actualiza automáticamente al modificar
  updatedAt!: Date;

  // Más adelante podríamos añadir métodos aquí, por ejemplo, para comparar contraseñas,
  // pero por ahora mantenemos la entidad simple (datos).
}
