import { Pool } from "pg";

let pool: Pool | null | undefined;

function getPool(): Pool | null {
  if (pool === undefined) {
    let connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      pool = null;
    } else {
      const wantsSsl =
        process.env.DATABASE_SSL === "true" ||
        /[?&]sslmode=(require|prefer|verify-ca|verify-full)/i.test(
          connectionString,
        );

      const queryIndex = connectionString.indexOf("?");
      if (queryIndex !== -1) {
        const base = connectionString.slice(0, queryIndex);
        const params = connectionString
          .slice(queryIndex + 1)
          .split("&")
          .filter((param) => param && !/^sslmode=/i.test(param));
        connectionString =
          params.length > 0 ? `${base}?${params.join("&")}` : base;
      }

      const insecure = process.env.DATABASE_SSL_INSECURE === "true";
      const ssl = wantsSsl ? { rejectUnauthorized: !insecure } : undefined;
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
  seo_title TEXT,
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

CREATE TABLE IF NOT EXISTS login_attempts (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

export type QueryResult<T> = {
  rows: T[];
  rowCount: number;
};

export async function getPoolOrNull(): Promise<Pool | null> {
  return getPool();
}

export async function ensureSchema(): Promise<string | null> {
  const client = getPool();
  if (!client) return "pool=null (DATABASE_URL ausente)";
  try {
    await client.query(SCHEMA);
    await client.query(
      "ALTER TABLE novedades ADD COLUMN IF NOT EXISTS image_url TEXT",
    );
    await client.query(
      "ALTER TABLE projects ADD COLUMN IF NOT EXISTS seo_title TEXT",
    );
    await client.query(
      "ALTER TABLE login_attempts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()",
    );
    await client.query(
      `INSERT INTO novedad_categorias (name)
       SELECT DISTINCT category FROM novedades WHERE category IS NOT NULL
       ON CONFLICT (name) DO NOTHING`,
    );
    return null;
  } catch (error) {
    const code =
      error instanceof Error
        ? (error as { code?: unknown }).code
        : undefined;
    const codeSuffix =
      typeof code === "string" || typeof code === "number"
        ? ` (code=${code})`
        : "";
    const detail =
      error instanceof Error
        ? `${error.name}: ${error.message}${codeSuffix}`
        : String(error);
    console.error("[db] ensureSchema failed:", detail, error);
    return detail;
  }
}