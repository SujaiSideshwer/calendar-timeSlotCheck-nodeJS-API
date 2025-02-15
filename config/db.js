import pg from "pg";
import { ENV_VARS } from "./envVars.js";
import { createSchemaSQL } from "../models/calendar.model.js";

const { Client } = pg;

// connecting to DB with the Postgres DB data got from environment variables
const db = new Client({
  user: ENV_VARS.PG_USER,
  host: ENV_VARS.PG_HOST,
  database: ENV_VARS.PG_DB_NAME,
  password: ENV_VARS.PG_PASSWORD,
  port: ENV_VARS.PG_PORT,
});
await db.connect();

export const connectDB = async () => {
  try {
    const res = await db.query("SELECT $1::text as message", ["Hello world!"]);
    await db.query(createSchemaSQL); //Creating the schema and tables whih shall be used for storing user enterred data
    console.log(res.rows[0].message); // Displays Hello world to show that we have connected to the Postgres DB
  } catch (err) {
    console.error(err);
  }
};

export default db;
