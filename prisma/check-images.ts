import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkImages() {
  console.log('🔍 Checking current image URLs in database...')

  const productImages = await prisma.productImage.findMany({
    select: {
      id: true,
      url: true,
      altText: true,
      product: {
        select: {
          title: true
        }
      }
    },
    take: 10
  })

  console.log('\n📸 Current product image URLs:')
  productImages.forEach(image => {
    console.log(`ID: ${image.id} | Product: ${image.product.title} | URL: ${image.url}`)
  })

  console.log(`\n📊 Total product images in database: ${productImages.length}`)
  
  // Check if any use Vercel Blob Storage
  const blobUrls = productImages.filter(img => img.url.includes('blob.vercel-storage.com'))
  const localUrls = productImages.filter(img => img.url.startsWith('/pictures/'))
  
  console.log(`🌐 Using Vercel Blob Storage: ${blobUrls.length}`)
  console.log(`📁 Using local /pictures/: ${localUrls.length}`)

  await prisma.$disconnect()
}

checkImages()
  .catch(async (e) => {
    console.error('❌ Error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })