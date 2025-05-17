import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "./appConfig"; // Importa la configuración centralizada

const AppDataSource = new DataSource({
  type: config.database.type as "postgres", // Type assertion
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: config.database.synchronize,
  logging: config.database.logging,
  entities: config.database.entities,
  migrations: config.database.migrations,
  subscribers: config.database.subscribers,
});

export default AppDataSource;
