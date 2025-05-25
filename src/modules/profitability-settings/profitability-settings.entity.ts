// src/modules/profitability-settings/profitability-settings.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ValueTransformer,
} from 'typeorm';
import { User } from '../user/user.entity';

class ColumnNumericTransformer implements ValueTransformer {
  to(data: number | null): number | null {
    // de la app a la BD
    return data;
  }
  from(data: string | null): number | null {
    // de la BD a la app
    if (data === null) return null;
    return parseFloat(data);
  }
}

@Entity('user_profitability_settings')
export class UserProfitabilitySettings {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
  // user_id se manejará a través de la relación `user`

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 4,
    default: 0.0,
    comment: 'Ej: 0.035 para 3.5%',
    transformer: new ColumnNumericTransformer(),
  })
  iibb_rate!: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 4,
    default: 0.0,
    comment: 'Ej: 0.01 para 1%',
    transformer: new ColumnNumericTransformer(),
  })
  municipal_rate!: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 4,
    default: 0.0,
    comment: 'Costo financiero sobre ingresos por venta',
    transformer: new ColumnNumericTransformer(),
  })
  financial_cost_rate!: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 4,
    default: 0.0,
    comment: 'Otras comisiones sobre PVP',
    transformer: new ColumnNumericTransformer(),
  })
  other_commission_rate!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
    comment: 'Gasto logístico fijo por unidad',
    transformer: new ColumnNumericTransformer(),
  })
  logistic_cost_fixed!: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 4,
    default: 0.0,
    comment: 'Gasto logístico variable sobre PVP',
    transformer: new ColumnNumericTransformer(),
  })
  logistic_cost_variable_rate!: number;

  @Column({
    type: 'boolean',
    default: true,
    comment: 'Si el vendedor es sujeto obligado de IVA',
  })
  is_iva_subject_obligated!: boolean;

  // Para tiers más altos o necesidades específicas
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
    comment: 'Costos fijos no operativos por unidad',
    transformer: new ColumnNumericTransformer(),
  })
  non_operational_costs_fixed_per_unit!: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 4,
    default: 0.0,
    comment: 'Costos variables no operativos sobre PVP',
    transformer: new ColumnNumericTransformer(),
  })
  non_operational_costs_variable_rate!: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}
