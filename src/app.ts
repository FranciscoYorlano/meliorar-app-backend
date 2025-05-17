import express, { Request, Response, Application } from "express";

const app: Application = express();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000; // Puerto para el servidor

// Middleware para parsear JSON (si vas a recibir JSON en el body de las requests)
app.use(express.json());

// Una ruta de prueba
app.get("/", (req: Request, res: Response) => {
  res.send("¡Hola Mundo desde Express con TypeScript!");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
