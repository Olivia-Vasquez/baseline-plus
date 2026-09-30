import "server-only";

import { randomUUID } from "node:crypto";
import { betterAuth } from "better-auth";
import { Resend } from "resend";
import { getDatabasePool } from "@/lib/database";

const configuredBaseURL = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL;
const baseURL = configuredBaseURL ?? "http://localhost:3000";
const secret = process.env.BETTER_AUTH_SECRET;

if (process.env.NODE_ENV === "production" && (!secret || secret.length < 32)) {
  throw new Error("BETTER_AUTH_SECRET must contain at least 32 characters in production.");
}
if (process.env.NODE_ENV === "production" && !configuredBaseURL) {
  throw new Error("BETTER_AUTH_URL must be configured in production.");
}

export const auth = betterAuth({
  appName: "Baseline",
  baseURL,
  secret: secret ?? "baseline-development-only-secret-change-me",
  database: getDatabasePool(),
  user: {
    modelName: "users",
    fields: {
      name: "display_name",
      emailVerified: "email_verified",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  session: {
    modelName: "user_sessions",
    fields: {
      userId: "user_id",
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
    },
  },
  account: {
    modelName: "user_accounts",
    fields: {
      accountId: "account_id",
      providerId: "provider_id",
      userId: "user_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      idToken: "id_token",
      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  verification: {
    modelName: "auth_verifications",
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    requireEmailVerification: true,
    // A repeat sign-up for an existing email returns a generic response and does not
    // resend verification on its own; resend here so unverified users aren't stuck.
    onExistingUserSignUp: async ({ user }) => {
      if (!user.emailVerified) {
        await auth.api.sendVerificationEmail({ body: { email: user.email, callbackURL: "/home" } });
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        if (process.env.NODE_ENV === "development") {
          console.info("[Baseline] Local email verification URL:", url);
          return;
        }
        throw new Error("RESEND_API_KEY must be configured to send verification email.");
      }

      const from = process.env.RESEND_FROM_EMAIL;
      if (!from) {
        throw new Error("RESEND_FROM_EMAIL must be configured to send verification email.");
      }

      const { error } = await new Resend(apiKey).emails.send({
        from,
        to: [user.email],
        subject: "Verify your Baseline account",
        text: `Verify your email address to access Baseline: ${url}`,
      });
      if (error) {
        throw new Error(`Unable to send verification email: ${error.message}`);
      }
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            email: user.email.trim().toLowerCase(),
            name: user.name.trim(),
          },
        }),
      },
    },
  },
  advanced: {
    database: {
      generateId: () => randomUUID(),
    },
  },
});