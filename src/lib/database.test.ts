import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

describe("getBaselineUserId", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("throws DatabaseConfigurationError when BASELINE_USER_ID is missing", async () => {
    delete process.env.BASELINE_USER_ID;
    const { getBaselineUserId, DatabaseConfigurationError } = await import("./database");
    expect(() => getBaselineUserId()).toThrow(DatabaseConfigurationError);
  });

  it("throws DatabaseConfigurationError when BASELINE_USER_ID is not a valid UUID", async () => {
    process.env.BASELINE_USER_ID = "not-a-uuid";
    const { getBaselineUserId, DatabaseConfigurationError } = await import("./database");
    expect(() => getBaselineUserId()).toThrow(DatabaseConfigurationError);
  });

  it("returns the trimmed UUID when valid", async () => {
    process.env.BASELINE_USER_ID = "  4f9a3b7e-2b1c-4b41-9a3d-6f3f3c3d0a11  ";
    const { getBaselineUserId } = await import("./database");
    expect(getBaselineUserId()).toBe("4f9a3b7e-2b1c-4b41-9a3d-6f3f3c3d0a11");
  });
});

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
