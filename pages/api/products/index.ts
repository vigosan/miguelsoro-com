import type { NextApiRequest, NextApiResponse } from 'next'
import { SupabaseProductRepository } from '@/infra/SupabaseProductRepository'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const productRepository = new SupabaseProductRepository()
      const products = await productRepository.findAll()
      
      return res.status(200).json({ products })
    } catch (error) {
      console.error('Error fetching products:', error)
      return res.status(500).json({ error: 'Failed to fetch products' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}