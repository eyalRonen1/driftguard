import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

// Prevent connection pool leaks during hot-reload in development
const globalForDb = globalThis as unknown as { dbClient: ReturnType<typeof postgres> | undefined };

const client = globalForDb.dbClient ?? postgres(connectionString, {
  prepare: false,
  max: 10, // Connection pool limit
  idle_timeout: 20, // Close idle connections after 20s
  connect_timeout: 10, // Timeout connection attempts after 10s
});

if (process.env.NODE_ENV !== "production") {
  globalForDb.dbClient = client;
}

export const db = drizzle(client, { schema });
