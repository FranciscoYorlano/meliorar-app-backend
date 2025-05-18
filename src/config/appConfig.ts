import dotenv from 'dotenv';
dotenv.config();

export const config = {
  serverPort: process.env.PORT ? parseInt(process.env.PORT) : 3001,
  database: {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: process.env.NODE_ENV === 'development', // true en desarrollo, false en prod
    logging: false, //process.env.NODE_ENV === "development", // true en desarrollo, false en prod
    entities: [__dirname + '/../**/*.entity{.ts,.js}'], // Ajusta esta ruta cuando tengas entidades
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    subscribers: [],
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_if_not_in_env',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  meli: {
    appId: process.env.MELI_APP_ID,
    clientSecret: process.env.MELI_CLIENT_SECRET,
    redirectUri: process.env.MELI_REDIRECT_URI,
    authUrl: 'https://auth.mercadolibre.com.ar/authorization', // Para Argentina
    tokenUrl: 'https://api.mercadolibre.com/oauth/token', // Para intercambiar código por token
  },
};
