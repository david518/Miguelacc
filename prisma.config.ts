import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Fallback allows `prisma generate` to run during Docker build (no real connection made).
    // At runtime Zeabur injects the real DATABASE_URL from the PostgreSQL service.
    url: process.env.DATABASE_URL ?? "postgresql://x:x@localhost:5432/x",
  },
  migrations: {
    path: "prisma/migrations",
  },
});
