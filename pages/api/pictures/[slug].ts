import type { NextApiRequest, NextApiResponse } from 'next'
import { DatabaseProductRepository } from '@/infra/DatabaseProductRepository'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { slug } = req.query

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Invalid slug parameter' })
  }

  try {
    const productRepository = new DatabaseProductRepository()
    const product = await productRepository.findBySlug(slug)
    
    if (!product) {
      return res.status(404).json({ error: 'Picture not found' })
    }
    
    // Convert product to public picture format
    const picture = {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.basePrice,
      size: product.productType.displayName,
      slug: product.slug,
      imageUrl: product.images.find(img => img.isPrimary)?.url || product.images[0]?.url || '',
      status: product.variants.length > 0 && product.variants[0].status === 'AVAILABLE' ? 'AVAILABLE' : 'SOLD',
      productTypeId: product.productType.id,
      productTypeName: product.productType.displayName,
      stock: product.variants.reduce((total, variant) => total + variant.stock, 0),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }
    
    return res.status(200).json(picture)
  } catch (error) {
    console.error('Error fetching public picture:', error)
    return res.status(500).json({ error: 'Failed to fetch picture' })
  }
}

export default handler