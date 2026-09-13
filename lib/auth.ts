import { betterAuth } from "better-auth/minimal";
import { createAuthEndpoint, APIError } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "./db";
import { user, session, account, verification } from "./db/schema";
import { eq } from "drizzle-orm";

export const devLoginEnabled =
  process.env.NODE_ENV === "development" &&
  process.env.ENABLE_DEV_LOGIN === "true";
export const googleEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);

export const auth = betterAuth({
  appName: "Spending Insights",
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  socialProviders: googleEnabled
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
      }
    : {},
  plugins: devLoginEnabled
    ? [
        {
          id: "local-development",
          endpoints: {
            devLogin: createAuthEndpoint(
              "/dev-login",
              { method: "POST" },
              async (context) => {
                const origin = context.headers?.get("origin");
                const base = new URL(
                  process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
                );
                if (
                  !devLoginEnabled ||
                  !["localhost", "127.0.0.1", "[::1]"].includes(
                    base.hostname,
                  ) ||
                  origin !== base.origin
                ) {
                  throw new APIError("FORBIDDEN");
                }
                await db
                  .insert(user)
                  .values({
                    id: "local-developer",
                    name: "Gideon (local)",
                    email: "developer@localhost",
                    emailVerified: true,
                  })
                  .onConflictDoNothing();
                const [developer] = await db
                  .select()
                  .from(user)
                  .where(eq(user.id, "local-developer"));
                const session =
                  await context.context.internalAdapter.createSession(
                    developer.id,
                  );
                if (!session) throw new APIError("INTERNAL_SERVER_ERROR");
                await setSessionCookie(context, { session, user: developer });
                return context.json({ success: true });
              },
            ),
          },
        },
      ]
    : [],
});
