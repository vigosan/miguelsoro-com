import { PrismaClient } from '@prisma/client'
import { put } from '@vercel/blob'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

async function migrateImages() {
  console.log('🚀 Starting image migration to Vercel Blob Storage...')

  // Get all product images that are still using local paths
  const localImages = await prisma.productImage.findMany({
    where: {
      url: {
        startsWith: '/pictures/'
      }
    },
    include: {
      product: {
        select: {
          title: true
        }
      }
    }
  })

  console.log(`📁 Found ${localImages.length} images to migrate`)

  let successCount = 0
  let errorCount = 0

  for (const image of localImages) {
    try {
      // Extract filename from URL (e.g., "/pictures/1.webp" -> "1.webp")
      const filename = image.url.replace('/pictures/', '')
      const localPath = join(process.cwd(), 'public', 'pictures', filename)
      
      console.log(`\n📤 Migrating: ${filename} for product "${image.product.title}"`)
      
      // Check if local file exists
      if (!existsSync(localPath)) {
        console.log(`❌ File not found: ${localPath}`)
        errorCount++
        continue
      }

      // Read the file
      const fileBuffer = readFileSync(localPath)
      console.log(`📦 File size: ${(fileBuffer.length / 1024).toFixed(1)} KB`)

      // Upload to Vercel Blob Storage
      const blob = await put(`pictures/${filename}`, fileBuffer, {
        access: 'public',
        contentType: 'image/webp',
      })

      console.log(`☁️ Uploaded to: ${blob.url}`)

      // Update database with new URL
      await prisma.productImage.update({
        where: { id: image.id },
        data: { 
          url: blob.url 
        }
      })

      console.log(`✅ Database updated for image ${image.id}`)
      successCount++

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))

    } catch (error) {
      console.error(`❌ Error migrating ${image.url}:`, error)
      errorCount++
    }
  }

  console.log(`\n🏁 Migration completed!`)
  console.log(`✅ Successfully migrated: ${successCount} images`)
  console.log(`❌ Failed: ${errorCount} images`)

  await prisma.$disconnect()
}

migrateImages()
  .catch(async (e) => {
    console.error('❌ Migration failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })