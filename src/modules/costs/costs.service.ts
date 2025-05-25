// src/modules/costs/costs.service.ts
import { Workbook, Worksheet } from 'exceljs';
import { Readable } from 'stream';
import AppDataSource from '../../config/dataSource';
import { MeliUserPublication } from '../meli-user-publications/meli-user-publications.entity';
import { User } from '../user/user.entity';
import { HttpException } from '../../utils/HttpException';
// CostExcelRowDto no es estrictamente necesario si parseamos directo, pero puede ser útil para claridad
// import { CostExcelRowDto } from './costs.dto';
import { Repository } from 'typeorm';

interface ProcessedRowResult {
  sku: string;
  status:
    | 'actualizado'
    | 'no_encontrado'
    | 'error_iva'
    | 'error_costo'
    | 'error_formato';
  message: string;
}

export class CostsService {
  private meliUserPublicationRepository: Repository<MeliUserPublication>;
  private userRepository: Repository<User>;

  constructor() {
    this.meliUserPublicationRepository =
      AppDataSource.getRepository(MeliUserPublication);
    this.userRepository = AppDataSource.getRepository(User);
  }

  private isValidIva(iva: any): iva is number {
    // Permitimos 0 (exento o ya incluido), 0.105, 0.21, 0.27
    const validIvaValues = [0, 0.105, 0.21, 0.27];
    // Usar toFixed(3) para manejar pequeñas imprecisiones de flotantes si el usuario ingresa ej. 0.210
    return (
      typeof iva === 'number' &&
      validIvaValues.some((validVal) => parseFloat(iva.toFixed(3)) === validVal)
    );
  }

  private isValidCost(costoNeto: any): costoNeto is number {
    return typeof costoNeto === 'number' && costoNeto >= 0;
  }

  public async processCostExcel(
    fileBuffer: Buffer,
    appUserId: string
  ): Promise<{ summary: string; results: ProcessedRowResult[] }> {
    const user = await this.userRepository.findOneBy({ id: appUserId });
    if (!user) {
      throw new HttpException(404, 'Usuario no encontrado.');
    }

    const workbook = new Workbook();
    const stream = Readable.from(fileBuffer);

    try {
      await workbook.xlsx.read(stream);
    } catch (error) {
      console.error('Error al leer el archivo Excel:', error);
      throw new HttpException(
        400,
        'Error al procesar el archivo Excel. Asegúrate de que el formato sea correcto (.xlsx).'
      );
    }

    const worksheet: Worksheet | undefined = workbook.worksheets[0];
    if (!worksheet) {
      throw new HttpException(
        400,
        'El archivo Excel está vacío o no contiene hojas.'
      );
    }

    const results: ProcessedRowResult[] = [];
    let updatedCount = 0;
    let notFoundCount = 0;
    let errorIvaCount = 0;
    let errorCostoCount = 0;
    let errorFormatoCount = 0;

    const headerRowRaw = worksheet.getRow(1).values;
    // Limpiar y convertir a string los valores de los encabezados
    // exceljs puede devolver valores extraños (undefined, null, objetos con richText)
    const headerRow = (
      Array.isArray(headerRowRaw) ? headerRowRaw : Object.values(headerRowRaw)
    )
      .map((header) => {
        if (typeof header === 'string') return header.trim().toLowerCase();
        if (
          header &&
          typeof header === 'object' &&
          'richText' in header &&
          Array.isArray((header as any).richText)
        ) {
          return (header as any).richText
            .map((rt: any) => rt.text)
            .join('')
            .trim()
            .toLowerCase();
        }
        return ''; // o algún placeholder si prefieres
      })
      .filter(Boolean); // Filtrar vacíos

    const skuHeaderIndex = headerRow.indexOf('sku');
    const costoNetoHeaderIndex = headerRow.indexOf('costo neto');
    const ivaHeaderIndex = headerRow.indexOf('iva');
    // const descripcionHeaderIndex = headerRow.indexOf('descripción'); // Opcional

    if (
      skuHeaderIndex === -1 ||
      costoNetoHeaderIndex === -1 ||
      ivaHeaderIndex === -1
    ) {
      console.error('Encabezados encontrados:', headerRow);
      throw new HttpException(
        400,
        'Encabezados requeridos (SKU, Costo neto, IVA) no encontrados o mal nombrados en la primera fila del archivo Excel. Asegúrate de que los nombres sean exactos (no sensible a mayúsculas/minúsculas).'
      );
    }

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);

      const skuCell = row.getCell(skuHeaderIndex + 1); // +1 porque los índices de celda son base 1
      const costoNetoCell = row.getCell(costoNetoHeaderIndex + 1);
      const ivaCell = row.getCell(ivaHeaderIndex + 1);

      const sku = skuCell.value ? String(skuCell.value).trim() : null;
      // exceljs puede devolver el número como string o número
      const costoNetoValue = costoNetoCell.value;
      const costoNeto =
        costoNetoValue !== null &&
        costoNetoValue !== undefined &&
        !isNaN(parseFloat(String(costoNetoValue)))
          ? parseFloat(String(costoNetoValue))
          : null;

      const ivaValue = ivaCell.value;
      const iva =
        ivaValue !== null &&
        ivaValue !== undefined &&
        !isNaN(parseFloat(String(ivaValue)))
          ? parseFloat(String(ivaValue))
          : null;

      if (!sku) {
        results.push({
          sku: `Fila ${i}`,
          status: 'error_formato',
          message: `Fila ${i} sin SKU o SKU inválido.`,
        });
        errorFormatoCount++;
        continue;
      }

      if (costoNeto === null || !this.isValidCost(costoNeto)) {
        results.push({
          sku,
          status: 'error_costo',
          message: `Costo neto inválido o faltante para SKU ${sku} (fila ${i}). Se esperaba un número >= 0.`,
        });
        errorCostoCount++;
        continue;
      }

      if (iva === null || !this.isValidIva(iva)) {
        results.push({
          sku,
          status: 'error_iva',
          message: `Valor de IVA inválido o faltante para SKU ${sku} (fila ${i}). Valores numéricos permitidos: 0, 0.105, 0.21, 0.27.`,
        });
        errorIvaCount++;
        continue;
      }

      const publication = await this.meliUserPublicationRepository.findOne({
        where: { user: { id: appUserId }, sku: sku },
      });

      if (publication) {
        // CORRECCIÓN: Guardar costoNeto directamente y la tasa de IVA por separado
        publication.cost_price_user = parseFloat(costoNeto.toFixed(2)); // El costo neto tal cual del Excel
        publication.iva_rate_user = iva; // La tasa de IVA (ej: 0.21)
        publication.cost_last_updated_at = new Date();

        await this.meliUserPublicationRepository.save(publication);
        results.push({
          sku,
          status: 'actualizado',
          message: `Costo y tasa de IVA actualizados para SKU ${sku}.`,
        });
        updatedCount++;
      } else {
        results.push({
          sku,
          status: 'no_encontrado',
          message: `SKU ${sku} no encontrado en tus publicaciones sincronizadas.`,
        });
        notFoundCount++;
      }
    }

    const summary = `Procesamiento completado. Actualizados: ${updatedCount}. No encontrados: ${notFoundCount}. Errores de formato: ${errorFormatoCount}. Errores de IVA: ${errorIvaCount}. Errores de costo: ${errorCostoCount}.`;
    return { summary, results };
  }
}
