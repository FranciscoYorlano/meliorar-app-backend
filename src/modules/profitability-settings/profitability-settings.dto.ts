// src/modules/profitability-settings/profitability-settings.dto.ts
import { IsBoolean, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpdateProfitabilitySettingsDto {
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 4 },
    { message: 'La tasa de IIBB debe ser un número con hasta 4 decimales.' }
  )
  @Min(0, { message: 'La tasa de IIBB no puede ser negativa.' })
  @Max(1, { message: 'La tasa de IIBB no puede ser mayor a 1 (100%).' }) // Asumiendo que se guarda como decimal (0.035)
  iibb_rate?: number;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 4 },
    { message: 'La tasa municipal debe ser un número con hasta 4 decimales.' }
  )
  @Min(0, { message: 'La tasa municipal no puede ser negativa.' })
  @Max(1, { message: 'La tasa municipal no puede ser mayor a 1 (100%).' })
  municipal_rate?: number;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 4 },
    { message: 'El costo financiero debe ser un número con hasta 4 decimales.' }
  )
  @Min(0, { message: 'El costo financiero no puede ser negativo.' })
  @Max(1, { message: 'El costo financiero no puede ser mayor a 1 (100%).' })
  financial_cost_rate?: number;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 4 },
    { message: 'Otras comisiones deben ser un número con hasta 4 decimales.' }
  )
  @Min(0, { message: 'Otras comisiones no pueden ser negativas.' })
  @Max(1, { message: 'Otras comisiones no pueden ser mayor a 1 (100%).' })
  other_commission_rate?: number;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'El costo logístico fijo debe ser un número con hasta 2 decimales.',
    }
  )
  @Min(0, { message: 'El costo logístico fijo no puede ser negativo.' })
  logistic_cost_fixed?: number;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 4 },
    {
      message:
        'El costo logístico variable debe ser un número con hasta 4 decimales.',
    }
  )
  @Min(0, { message: 'El costo logístico variable no puede ser negativo.' })
  @Max(1, {
    message: 'El costo logístico variable no puede ser mayor a 1 (100%).',
  })
  logistic_cost_variable_rate?: number;

  @IsOptional()
  @IsBoolean({
    message: 'El campo "sujeto obligado de IVA" debe ser un valor booleano.',
  })
  is_iva_subject_obligated?: boolean;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Los costos fijos no operativos deben ser un número con hasta 2 decimales.',
    }
  )
  @Min(0, {
    message: 'Los costos fijos no operativos no pueden ser negativos.',
  })
  non_operational_costs_fixed_per_unit?: number;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 4 },
    {
      message:
        'Los costos variables no operativos deben ser un número con hasta 4 decimales.',
    }
  )
  @Min(0, {
    message: 'Los costos variables no operativos no pueden ser negativos.',
  })
  @Max(1, {
    message:
      'Los costos variables no operativos no pueden ser mayor a 1 (100%).',
  })
  non_operational_costs_variable_rate?: number;
}
