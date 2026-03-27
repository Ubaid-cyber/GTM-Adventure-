import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

/**
 * Get the direct PostgreSQL connection string.
 * Priority:
 * 1. DIRECT_DATABASE_URL (explicit direct postgres URL, most reliable)
 * 2. Parse the API key JWT from prisma+postgres:// URL
 * 3. Fallback: use DATABASE_URL directly
 */
function getPgConnectionString(): string {
  if (process.env.DIRECT_DATABASE_URL) {
    return process.env.DIRECT_DATABASE_URL
  }

  const url = process.env.DATABASE_URL || ''

  if (url.startsWith('prisma+postgres')) {
    try {
      const parts = url.split('?api_key=')
      if (parts.length === 2) {
        const payload = parts[1]
        const decoded = Buffer.from(payload, 'base64url').toString('utf-8')
        const json = JSON.parse(decoded)
        if (json.databaseUrl) {
          return json.databaseUrl
        }
      }
    } catch {
      // Fall through to direct URL
    }
  }

  return url
}

const pgConnectionString = getPgConnectionString()
const pool = new Pool({ connectionString: pgConnectionString })
const adapter = new PrismaPg(pool as any)

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
