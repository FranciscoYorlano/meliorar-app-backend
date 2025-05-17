import AppDataSource from "../config/dataSource";

export const connectDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("¡Conexión a la base de datos establecida exitosamente!");
    // Aquí podrías añadir lógica adicional post-conexión si fuera necesario
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
    process.exit(1); // Si la BD no conecta, la app no puede funcionar, así que salimos.
  }
};
