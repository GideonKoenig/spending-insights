import { config } from "dotenv";
import { migrate } from "drizzle-orm/node-postgres/migrator";

config({ path: ".env.local" });
config();
const { db, pool } = await import("../lib/db");
try {
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Database migrations applied.");
} finally {
  await pool.end();
}
