import type { NextApiRequest, NextApiResponse } from 'next'
import { SupabaseProductRepository } from '@/infra/SupabaseProductRepository'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query

  if (typeof slug !== 'string') {
    return res.status(400).json({ error: 'Invalid product slug' })
  }

  if (req.method === 'GET') {
    try {
      const productRepository = new SupabaseProductRepository()
      const product = await productRepository.findBySlug(slug)

      if (!product) {
        return res.status(404).json({ error: 'Product not found' })
      }

      return res.status(200).json({ product })
    } catch (error) {
      console.error('Error fetching product:', error)
      return res.status(500).json({ error: 'Failed to fetch product' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}