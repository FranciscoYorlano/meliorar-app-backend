// src/modules/meli-user-publication/meli-user-publication.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity('meli_user_publications')
@Unique('UQ_USER_MELI_ITEM', ['user', 'meli_item_id']) // Índice único para user_id y meli_item_id
export class MeliUserPublication {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'ID de la publicación en MELI, ej: MLA123...',
  })
  meli_item_id!: string;

  @ManyToOne(() => User, (user) => user.meli_user_publications, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' }) // Esto creará una columna user_id
  user!: User;
  // user_id se manejará a través de la relación `user`

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sku!: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price_meli!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category_id_meli!: string | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Costo del producto ingresado por el usuario',
  })
  cost_price_user!: number | null;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 3,
    nullable: true,
    comment: 'Tasa de IVA del costo del usuario (ej: 0.21, 0.105)',
  })
  iva_rate_user!: number | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Fecha de actualización del costo del usuario',
  })
  cost_last_updated_at!: Date | null;

  @Column({
    type: 'timestamp with time zone',
    comment: 'Cuándo se obtuvo/actualizó esta info desde MELI',
  })
  publication_last_fetched_from_meli_at!: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}
