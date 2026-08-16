import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Next.js hot-reloads modules in dev, which would otherwise create a fresh
// PrismaClient (and a fresh connection pool) on every edit. Stash the
// instance on `globalThis` so dev reuses one across reloads; production
// always gets a single instance per server process.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function makePrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and fill in your Supabase pooled connection string."
    );
  }

  // Runtime queries go through the pooled (Supavisor) connection string —
  // migrations use the direct one, configured separately in prisma.config.ts.
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? makePrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
