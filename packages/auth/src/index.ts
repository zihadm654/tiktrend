import { db } from "@tiktrend/db";
import * as schema from "@tiktrend/db/schema/auth";
import { env } from "@tiktrend/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

const adminEmails = new Set(
  env.ADMIN_EMAILS.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",

    schema,
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: adminEmails.has((user.email ?? "").toLowerCase())
            ? {
                ...user,
                role: "admin",
              }
            : user,
        }),
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
  trustedOrigins: [env.CORS_ORIGIN],
  user: {
    additionalFields: {
      role: {
        defaultValue: "customer",
        required: false,
        type: "string",
      },
    },
  },
});
