import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { pictures as staticPictures } from '../data/pictures'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting product system seed...')

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@miguelsoro.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
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

  // Create Product Types
  const cuadrosType = await prisma.productType.upsert({
    where: { name: 'cuadros' },
    update: {},
    create: {
      name: 'cuadros',
      displayName: 'Cuadros Originales',
      description: 'Obras de arte originales únicas',
      isActive: true,
    },
  })

  const reproduccionesType = await prisma.productType.upsert({
    where: { name: 'reproducciones' },
    update: {},
    create: {
      name: 'reproducciones',
      displayName: 'Reproducciones',
      description: 'Reproducciones de alta calidad de las obras originales',
      isActive: true,
    },
  })

  const camisetasType = await prisma.productType.upsert({
    where: { name: 'camisetas' },
    update: {},
    create: {
      name: 'camisetas',
      displayName: 'Camisetas',
      description: 'Camisetas con diseños inspirados en el ciclismo',
      isActive: true,
    },
  })

  console.log('✅ Product types created')

  // Create attributes for reproducciones
  const sizeAttribute = await prisma.productTypeAttribute.upsert({
    where: { 
      productTypeId_name: { 
        productTypeId: reproduccionesType.id, 
        name: 'tamaño' 
      }
    },
    update: {},
    create: {
      productTypeId: reproduccionesType.id,
      name: 'tamaño',
      displayName: 'Tamaño',
      type: 'SELECT',
      isRequired: true,
      sortOrder: 1,
    },
  })

  // Create size options for reproducciones
  const sizeOptions = [
    { value: 'A4', displayName: 'A4 (21x30 cm)', sortOrder: 1 },
    { value: 'A3', displayName: 'A3 (30x42 cm)', sortOrder: 2 },
    { value: 'A2', displayName: 'A2 (42x59 cm)', sortOrder: 3 },
    { value: 'A1', displayName: 'A1 (59x84 cm)', sortOrder: 4 },
  ]

  for (const option of sizeOptions) {
    await prisma.attributeOption.upsert({
      where: {
        attributeId_value: {
          attributeId: sizeAttribute.id,
          value: option.value
        }
      },
      update: {},
      create: {
        attributeId: sizeAttribute.id,
        value: option.value,
        displayName: option.displayName,
        sortOrder: option.sortOrder,
      },
    })
  }

  // Create attributes for camisetas
  const shirtSizeAttribute = await prisma.productTypeAttribute.upsert({
    where: { 
      productTypeId_name: { 
        productTypeId: camisetasType.id, 
        name: 'talla' 
      }
    },
    update: {},
    create: {
      productTypeId: camisetasType.id,
      name: 'talla',
      displayName: 'Talla',
      type: 'SELECT',
      isRequired: true,
      sortOrder: 1,
    },
  })

  // Create shirt size options
  const shirtSizeOptions = [
    { value: 'XS', displayName: 'Extra Pequeña', sortOrder: 1 },
    { value: 'S', displayName: 'Pequeña', sortOrder: 2 },
    { value: 'M', displayName: 'Mediana', sortOrder: 3 },
    { value: 'L', displayName: 'Grande', sortOrder: 4 },
    { value: 'XL', displayName: 'Extra Grande', sortOrder: 5 },
    { value: 'XXL', displayName: 'Extra Extra Grande', sortOrder: 6 },
  ]

  for (const option of shirtSizeOptions) {
    await prisma.attributeOption.upsert({
      where: {
        attributeId_value: {
          attributeId: shirtSizeAttribute.id,
          value: option.value
        }
      },
      update: {},
      create: {
        attributeId: shirtSizeAttribute.id,
        value: option.value,
        displayName: option.displayName,
        sortOrder: option.sortOrder,
      },
    })
  }

  const colorAttribute = await prisma.productTypeAttribute.upsert({
    where: { 
      productTypeId_name: { 
        productTypeId: camisetasType.id, 
        name: 'color' 
      }
    },
    update: {},
    create: {
      productTypeId: camisetasType.id,
      name: 'color',
      displayName: 'Color',
      type: 'SELECT',
      isRequired: true,
      sortOrder: 2,
    },
  })

  // Create color options for shirts
  const colorOptions = [
    { value: 'negro', displayName: 'Negro', sortOrder: 1 },
    { value: 'blanco', displayName: 'Blanco', sortOrder: 2 },
    { value: 'azul', displayName: 'Azul', sortOrder: 3 },
    { value: 'rojo', displayName: 'Rojo', sortOrder: 4 },
  ]

  for (const option of colorOptions) {
    await prisma.attributeOption.upsert({
      where: {
        attributeId_value: {
          attributeId: colorAttribute.id,
          value: option.value
        }
      },
      update: {},
      create: {
        attributeId: colorAttribute.id,
        value: option.value,
        displayName: option.displayName,
        sortOrder: option.sortOrder,
      },
    })
  }

  console.log('✅ Attributes and options created')

  // Migrate existing pictures to products
  for (const picture of staticPictures) {
    const product = await prisma.product.upsert({
      where: { slug: picture.slug },
      update: {
        title: picture.title,
        description: picture.description,
        basePrice: picture.price,
      },
      create: {
        id: picture.id,
        productTypeId: cuadrosType.id,
        title: picture.title,
        description: picture.description,
        slug: picture.slug,
        basePrice: picture.price,
        isActive: true,
      },
    })

    // Create product image
    const existingImage = await prisma.productImage.findFirst({
      where: {
        productId: product.id,
        sortOrder: 0
      }
    })

    if (!existingImage) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: `/pictures/${picture.id}.webp`,
          altText: picture.title,
          sortOrder: 0,
          isPrimary: true,
        },
      })
    }

    // Create a single variant for original paintings (unique pieces)
    const existingVariant = await prisma.productVariant.findFirst({
      where: {
        productId: product.id,
        sku: `${product.id}-original`
      }
    })

    if (!existingVariant) {
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: `${product.id}-original`,
          price: picture.price,
          stock: 1, // Unique piece
          status: 'AVAILABLE',
        },
      })
    }

    console.log(`✅ Migrated product: ${product.title}`)
  }

  console.log(`✅ Migrated ${staticPictures.length} products to database`)
  console.log('🌱 Product system seed completed!')
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