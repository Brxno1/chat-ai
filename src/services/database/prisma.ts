import 'dotenv/config'

import { PrismaClient } from './generated'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  try {
    return new PrismaClient({
      log: ['error'],
      datasourceUrl: process.env.DATABASE_URL,
    })
  } catch (error) {
    console.error('Failed to create Prisma client:', error)
    throw error
  }
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
