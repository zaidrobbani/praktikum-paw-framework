import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/paw?schema=public" })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // Clean up existing data
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      products: {
        create: [
          {
            name: 'Premium Dog Food',
            description: 'High quality dog food for adult dogs',
            price: 45.99,
            stock: 100,
          },
          {
            name: 'Cat Toy Mouse',
            description: 'Interactive mouse toy for cats',
            price: 12.50,
            stock: 50,
          }
        ]
      }
    }
  })

  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'Regular User',
      password: hashedPassword,
      products: {
        create: [
          {
            name: 'Bird Cage',
            description: 'Spacious cage for small to medium birds',
            price: 120.00,
            stock: 15,
          }
        ]
      }
    }
  })

  console.log({ admin, user })
  console.log('Seeding complete! 🌱')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })