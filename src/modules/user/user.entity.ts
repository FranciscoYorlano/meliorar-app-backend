import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { MeliUserPublication } from '../meli-user-publications/meli-user-publications.entity';
import { UserProfitabilitySettings } from '../profitability-settings/profitability-settings.entity';

@Entity('users') // Define el nombre de la tabla en la base de datos como 'users'
export class User {
  @PrimaryGeneratedColumn('uuid') // Define 'id' como llave primaria auto-generada (UUID)
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email!: string;

  @Column({ type: 'varchar', nullable: false })
  password_hash!: string;

  // Meli attributes
  @Column({ type: 'bigint', nullable: true, unique: true })
  meli_user_id!: number | null;

  @Column({ type: 'text', nullable: true })
  meli_access_token!: string | null;

  @Column({ type: 'text', nullable: true })
  meli_refresh_token!: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  meli_token_expires_at!: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  meli_last_sync_at!: Date | null;

  // Nuevo campo para la sincronización de publicaciones
  @Column({ type: 'timestamp with time zone', nullable: true })
  meli_last_publications_sync_at!: Date | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;

  // Relación: Un usuario puede tener muchas publicaciones de MELI cacheadas
  @OneToMany(
    () => MeliUserPublication,
    (publication) => publication.user
    // { cascade: true } // Considera el cascade si al borrar un usuario quieres borrar sus publicaciones cacheadas
  )
  meli_user_publications!: MeliUserPublication[];

  @OneToOne(() => UserProfitabilitySettings, (settings) => settings.user, {
    cascade: true,
  }) // cascade true para que se cree/actualice junto con el usuario si es necesario
  profitability_settings!: UserProfitabilitySettings | null; // Puede ser null si aún no los configuró
}
