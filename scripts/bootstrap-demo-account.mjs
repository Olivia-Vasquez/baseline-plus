import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { Pool } from "pg";

const demoUserId = "00000000-0000-4000-8000-000000000001";
const demoEmail = "demo@baseline.example";

if (process.env.NODE_ENV !== "development") {
  throw new Error("The demo account bootstrap can only run with NODE_ENV=development.");
}

const password = process.env.BASELINE_DEMO_PASSWORD;
if (!password || password.length < 12) {
  throw new Error("Set BASELINE_DEMO_PASSWORD to a password with at least 12 characters.");
}
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be configured.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();

try {
  await client.query("BEGIN");
  const userResult = await client.query(
    "SELECT id FROM users WHERE id = $1 AND lower(email) = lower($2) FOR UPDATE",
    [demoUserId, demoEmail],
  );
  if (userResult.rowCount !== 1) {
    throw new Error("Run the database seed before bootstrapping the demo account.");
  }

  const passwordHash = await hashPassword(password);
  await client.query("UPDATE users SET email_verified = TRUE WHERE id = $1", [demoUserId]);
  await client.query(
    `INSERT INTO user_accounts (id, account_id, provider_id, user_id, password)
     VALUES ($1, $2, 'credential', $3, $4)
     ON CONFLICT (provider_id, account_id)
     DO UPDATE SET password = EXCLUDED.password, updated_at = now()`,
    [randomUUID(), demoUserId, demoUserId, passwordHash],
  );
  await client.query("COMMIT");
  console.info(`Development demo account is ready: ${demoEmail}`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}