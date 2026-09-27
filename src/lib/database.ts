import "server-only";

import { Pool } from "pg";

export class DatabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseConfigurationError";
  }
}

const globalWithPool = globalThis as typeof globalThis & { baselineDatabasePool?: Pool };

export function getDatabasePool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new DatabaseConfigurationError("DATABASE_URL is not configured.");
  }

  if (!globalWithPool.baselineDatabasePool) {
    const configuredMax = Number(process.env.DATABASE_POOL_MAX ?? 10);
    const max = Number.isInteger(configuredMax) && configuredMax > 0 ? configuredMax : 10;
    globalWithPool.baselineDatabasePool = new Pool({
      connectionString,
      max,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      allowExitOnIdle: process.env.NODE_ENV !== "production",
    });
  }

  return globalWithPool.baselineDatabasePool;
}

export function getBaselineUserId(): string {
  const userId = process.env.BASELINE_USER_ID?.trim();
  if (!userId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
    throw new DatabaseConfigurationError("BASELINE_USER_ID must be a valid UUID.");
  }

  return userId;
}