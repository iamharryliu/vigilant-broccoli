import { Pool } from 'pg';

// Create a singleton pool instance
const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

export const pool = globalForDb.pool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

if (process.env.NODE_ENV !== 'production') globalForDb.pool = pool;

// Helper function for querying
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows;
}

// Helper function for getting single row
export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const result = await pool.query(text, params);
  return result.rows[0] || null;
}

// Helper function for executing (INSERT, UPDATE, DELETE)
export async function execute(text: string, params?: any[]): Promise<number> {
  const result = await pool.query(text, params);
  return result.rowCount || 0;
}
