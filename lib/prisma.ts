import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
    datasources: {
      db: {
        url: process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING
      }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma