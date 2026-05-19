import { neon } from '@neondatabase/serverless';

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  '';

if (!connectionString) {
  console.warn('[db] No DATABASE_URL / POSTGRES_URL set — queries will fail');
}

export const sql = neon(connectionString);
