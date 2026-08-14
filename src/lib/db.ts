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
  href TEXT NOT NULL DEFAULT '/',
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS novedad_categorias (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
    await client.query(
      "ALTER TABLE novedades ADD COLUMN IF NOT EXISTS image_url TEXT",
    );
    await client.query(
      `INSERT INTO novedad_categorias (name)
       SELECT DISTINCT category FROM novedades WHERE category IS NOT NULL
       ON CONFLICT (name) DO NOTHING`,
    );
  } catch (error) {
    console.error("[db] ensureSchema failed:", error);
  }
}