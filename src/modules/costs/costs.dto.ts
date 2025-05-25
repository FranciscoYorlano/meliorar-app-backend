// src/modules/costs/costs.dto.ts
export interface CostExcelRowDto {
  sku: string;
  descripcion?: string; // Descripción es opcional
  costoNeto: number;
  iva: number; // Ej: 0.21, 0.105, 0.27
}
