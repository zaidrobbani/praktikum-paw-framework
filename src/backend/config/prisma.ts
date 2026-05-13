import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (!globalForPrisma.prisma) {
      // Inisialisasi secara lazy saat dipanggil, mencegah Next.js build evaluation error
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const adapter = new PrismaPg(pool);
      globalForPrisma.prisma = new PrismaClient({ adapter });
    }
    return Reflect.get(globalForPrisma.prisma, prop);
  }
});

if (process.env.NODE_ENV !== "production")
  globalForPrisma.prisma = globalForPrisma.prisma;