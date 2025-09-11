import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { pictures as staticPictures } from '../data/pictures'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Get admin credentials from environment variables
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@miguelsoro.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

  // Create admin user
  const hashedPassword = await bcrypt.hash(adminPassword, 10)
  
  const adminUser = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: hashedPassword,
      role: 'admin',
    },
  })

  console.log('✅ Admin user created:', adminUser.email)

  // Migrate existing pictures
  for (const picture of staticPictures) {
    await prisma.picture.upsert({
      where: { slug: picture.slug },
      update: {
        title: picture.title,
        description: picture.description,
        price: picture.price,
        size: picture.size,
        imageUrl: `/pictures/${picture.id}.webp`, // Keep existing image paths for now
      },
      create: {
        id: picture.id,
        title: picture.title,
        description: picture.description,
        price: picture.price,
        size: picture.size,
        slug: picture.slug,
        imageUrl: `/pictures/${picture.id}.webp`,
        status: 'AVAILABLE',
      },
    })
  }

  console.log(`✅ Migrated ${staticPictures.length} pictures to database`)
  console.log('🌱 Database seed completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })