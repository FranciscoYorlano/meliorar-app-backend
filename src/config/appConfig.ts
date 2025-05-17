import dotenv from "dotenv";
dotenv.config(); // Carga las variables de entorno aquí, una sola vez.

export const config = {
  serverPort: process.env.PORT ? parseInt(process.env.PORT) : 3001,
  database: {
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: process.env.NODE_ENV === "development", // true en desarrollo, false en prod
    logging: process.env.NODE_ENV === "development", // true en desarrollo, false en prod
    entities: [__dirname + "/../**/*.entity{.ts,.js}"], // Ajusta esta ruta cuando tengas entidades
    migrations: [__dirname + "/../migrations/*{.ts,.js}"],
    subscribers: [],
  },
  // Puedes añadir más configuraciones aquí (JWT_SECRET, etc.)
};
