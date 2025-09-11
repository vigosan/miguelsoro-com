import type { NextApiRequest, NextApiResponse } from 'next'
import { DatabaseProductRepository } from '@/infra/DatabaseProductRepository'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid product ID' })
  }

  const productRepository = new DatabaseProductRepository()

  if (req.method === 'GET') {
    try {
      const product = await productRepository.findById(id)

      if (!product) {
        return res.status(404).json({ error: 'Product not found' })
      }

      // Convert product to legacy format
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

      return res.status(200).json({ picture })
    } catch (error) {
      console.error('Error fetching product:', error)
      return res.status(500).json({ error: 'Failed to fetch product' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { title, description, price, size, slug, status, productTypeId, stock } = req.body
      const { prisma } = await import('@/lib/prisma')

      // Check if product exists
      const existingProduct = await prisma.product.findUnique({
        where: { id }
      })

      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found' })
      }

      // Check if slug is being changed and if new slug already exists
      if (slug && slug !== existingProduct.slug) {
        const slugExists = await prisma.product.findUnique({
          where: { slug }
        })

        if (slugExists) {
          return res.status(400).json({ error: 'Slug already exists' })
        }
      }

      // Update product
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(price && { basePrice: parseInt(price) }),
          ...(slug && { slug }),
          ...(productTypeId && { productTypeId }),
        }
      })

      // Update variant price if provided
      if (price) {
        await prisma.productVariant.updateMany({
          where: { productId: id },
          data: { price: parseInt(price) }
        })
      }

      // Update variant stock if provided
      if (stock !== undefined) {
        await prisma.productVariant.updateMany({
          where: { productId: id },
          data: { stock: parseInt(stock) }
        })
      }

      // Update variant status if provided
      if (status) {
        const variantStatus = status === 'AVAILABLE' ? 'AVAILABLE' : 
                            status === 'SOLD' ? 'OUT_OF_STOCK' : 'AVAILABLE'
        
        await prisma.productVariant.updateMany({
          where: { productId: id },
          data: { status: variantStatus }
        })
      }

      // Fetch updated product with relations
      const product = await productRepository.findById(id)

      if (!product) {
        return res.status(404).json({ error: 'Product not found after update' })
      }

      // Convert to legacy format
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

      return res.status(200).json({ picture })
    } catch (error) {
      console.error('Error updating product:', error)
      return res.status(500).json({ error: 'Failed to update product' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const product = await productRepository.findById(id)

      if (!product) {
        return res.status(404).json({ error: 'Product not found' })
      }

      await productRepository.delete(id)

      return res.status(200).json({ message: 'Product deleted successfully' })
    } catch (error) {
      console.error('Error deleting product:', error)
      return res.status(500).json({ error: 'Failed to delete product' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}