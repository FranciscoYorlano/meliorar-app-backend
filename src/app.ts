import express, { Request, Response, Application, NextFunction } from 'express';
import AppDataSource from './config/dataSource';
import { config } from './config/appConfig'; // Importa la configuración para el puerto
import { HttpException } from './utils/HttpException';
import { errorResponse } from './utils/response';
import {
  authMessages,
  errorMessages,
  validationMessages,
} from './utils/bug_tracking/bug_tracking.messages';
import { MessageAPI } from './utils/bug_tracking/bug_tracking.types';

// Routers
import router from './routes';
import { globalErrorHandler } from './utils/globalErrorHandler';

const app: Application = express();
const PORT: number = config.serverPort; // Usa el puerto desde la config

app.use(express.json());

// Routers
app.use('/', router);

app.use((req: Request, res: Response, next: NextFunction) => {
  return errorResponse(res, errorMessages.NOT_FOUND, null);
});

app.use(globalErrorHandler);

AppDataSource.initialize()
  .then(() => {
    console.log('¡Conexión a la base de datos establecida exitosamente!');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error al conectar con la base de datos:', error);
    process.exit(1);
  });
