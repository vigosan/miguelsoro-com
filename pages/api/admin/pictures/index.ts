import type { NextApiRequest, NextApiResponse } from 'next'
import { DatabaseProductRepository } from '@/infra/DatabaseProductRepository'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const productRepository = new DatabaseProductRepository()
      const products = await productRepository.findAll()
      
      // Convert products to legacy format for admin compatibility
      const pictures = products.map(product => ({
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
      }))
      
      return res.status(200).json({ pictures })
    } catch (error) {
      console.error('Error fetching products:', error)
      return res.status(500).json({ error: 'Failed to fetch products' })
    }
  }

  if (req.method === 'POST') {
    try {
      // For now, creating products is not implemented through the admin API
      // This would require more complex logic for product types, variants, etc.
      return res.status(501).json({ error: 'Creating products not yet implemented' })
    } catch (error) {
      console.error('Error creating product:', error)
      return res.status(500).json({ error: 'Failed to create product' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}