// src/config/multerConfig.ts
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';
import { HttpException } from '../utils/HttpException';

// Configuración de almacenamiento (puedes usar memoryStorage o diskStorage)
// MemoryStorage es más simple para archivos pequeños, no los guarda en disco.
const storage = multer.memoryStorage();

// Filtro para aceptar solo archivos Excel
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedMimes = [
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'text/csv', // .csv (opcional, si quieres soportarlo también)
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new HttpException(
        400,
        'Formato de archivo no permitido. Solo se aceptan archivos Excel (.xls, .xlsx).'
      )
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // Límite de 5MB (ajusta según necesidad)
  },
});

export default upload;
