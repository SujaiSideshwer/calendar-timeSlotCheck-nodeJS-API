import dotenv from "dotenv";

dotenv.config();

// reading the environment variables data using dotenv package from .env and exporting them for use in other scripts
export const ENV_VARS = {
  PG_USER: process.env.PGUSER,
  PG_PORT: process.env.PGPORT,
  PG_HOST: process.env.PGHOST,
  PG_PASSWORD: process.env.PGPASSWORD,
  PG_DB_NAME: process.env.PGDB_NAME,
  BACKEND_SERVER_PORT: process.env.SERVER_PORT,
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET,
};
