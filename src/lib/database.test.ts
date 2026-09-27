import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

describe("getDatabasePool", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
    delete (globalThis as { baselineDatabasePool?: unknown }).baselineDatabasePool;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete (globalThis as { baselineDatabasePool?: unknown }).baselineDatabasePool;
  });

  it("throws DatabaseConfigurationError when DATABASE_URL is missing", async () => {
    delete process.env.DATABASE_URL;
    const { getDatabasePool, DatabaseConfigurationError } = await import("./database");
    expect(() => getDatabasePool()).toThrow(DatabaseConfigurationError);
  });

  it("returns a pool instance when DATABASE_URL is configured", async () => {
    process.env.DATABASE_URL = "postgres://user:pass@localhost:5432/baseline";
    const { getDatabasePool } = await import("./database");
    const pool = getDatabasePool();
    expect(pool).toBeTruthy();
    expect(typeof pool.query).toBe("function");
  });
});
