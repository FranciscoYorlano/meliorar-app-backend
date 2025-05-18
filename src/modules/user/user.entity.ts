import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  OneToMany,
} from 'typeorm';

@Entity('users') // Define el nombre de la tabla en la base de datos como 'users'
export class User {
  @PrimaryGeneratedColumn('uuid') // Define 'id' como llave primaria auto-generada (UUID)
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email!: string;

  @Column({ type: 'varchar', nullable: false })
  password_hash!: string; // Almacenaremos la contraseña hasheada

  // Meli attributes
  @Column({ type: 'bigint', nullable: true, unique: true })
  meli_user_id!: number | null;

  @Column({ type: 'text', nullable: true }) // 'text' para tokens que pueden ser largos
  meli_access_token!: string | null;

  @Column({ type: 'text', nullable: true })
  meli_refresh_token!: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  meli_token_expires_at!: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  meli_last_sync_at!: Date | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}
