import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon, type Pool } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

// The simplest and most correct configuration, as suggested by the user.
// Neon's client handles cold starts and timeouts internally.
const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql);

// The pool export is not used in the serverless context but we keep it for consistency.
export const pool: Pool | null = null;
