import { Pool } from "pg";

let pool: Pool | null | undefined;

function getPool(): Pool | null {
  if (pool === undefined) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      pool = null;
    } else {
      const ssl =
        process.env.DATABASE_SSL === "true" ||
        /sslmode=require/.test(connectionString)
          ? { rejectUnauthorized: false }
          : undefined;
      pool = new Pool({ connectionString, ssl });
    }
  }
  return pool;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS projects (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  video TEXT NOT NULL,
  year INTEGER NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  href TEXT NOT NULL DEFAULT '/',
  highlights TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS novedades (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  category TEXT NOT NULL,
  source TEXT,
  date TEXT NOT NULL,
  href TEXT NOT NULL DEFAULT '/'
);
`;

export type QueryResult<T> = {
  rows: T[];
  rowCount: number;
};

export async function getPoolOrNull(): Promise<Pool | null> {
  return getPool();
}

export async function ensureSchema(): Promise<void> {
  const client = getPool();
  if (!client) return;
  try {
    await client.query(SCHEMA);
  } catch (error) {
    console.error("[db] ensureSchema failed:", error);
  }
}