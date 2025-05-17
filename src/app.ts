import express, { Request, Response, Application, NextFunction } from "express";
import AppDataSource from "./config/dataSource";
import { config } from "./config/appConfig"; // Importa la configuración para el puerto

// Routers
import authRouter from "./routes/auth.routes";
import { HttpException } from "./utils/HttpException";

const app: Application = express();
const PORT: number = config.serverPort; // Usa el puerto desde la config

app.use(express.json());

// Routers
app.use("/api/auth", authRouter);

app.get("/api", (req: Request, res: Response) => {
  res.send("¡API de Meliorar funcionando!");
});

// Middleware de Manejo de Errores Global
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpException) {
    res.status(err.status).json({
      status: "error",
      statusCode: err.status,
      message: err.message,
    });
  } else {
    // Loggear el error para depuración interna en caso de errores no esperados
    console.error(err.stack); // Muestra el stack trace del error en la consola del servidor

    res.status(500).json({
      status: "error",
      statusCode: 500,
      message: "Ocurrió un error interno en el servidor.",
    });
  }
});

AppDataSource.initialize()
  .then(() => {
    console.log("¡Conexión a la base de datos establecida exitosamente!");
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error al conectar con la base de datos:", error);
    process.exit(1); // Salir si la BD no conecta
  });
