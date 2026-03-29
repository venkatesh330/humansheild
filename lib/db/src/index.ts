import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema/index.js";

const connectionString = process.env.DATABASE_URL;

export const pool = connectionString
  ? new Pool({ connectionString })
  : null;

export const db = pool
  ? drizzle(pool, { schema })
  : null;

export { schema };
export * from "./schema/index.js";
