// Prisma 7 config. The CLI (migrate, db seed, studio, introspect) needs a
// direct, non-pooled connection to run DDL/advisory locks — that's
// DIRECT_URL. The app's PrismaClient at runtime uses the pooled
// DATABASE_URL instead, via a driver adapter — see src/lib/prisma.ts.
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
