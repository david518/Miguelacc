import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

function resolveDbPath(): string {
  const raw = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  // strip file: or file:./ prefix, keep the path part
  const stripped = raw.replace(/^file:(\.\/)?/, "");
  // if already absolute, use as-is; otherwise resolve from cwd
  return path.isAbsolute(stripped)
    ? stripped
    : path.resolve(process.cwd(), stripped);
}

function createClient(): PrismaClient {
  const dbPath = resolveDbPath();
  // Adapter expects url param (it strips file: prefix itself, so pass raw path)
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
