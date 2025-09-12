import type { NextApiRequest, NextApiResponse } from 'next'
import { DatabasePictureRepository } from '@/infra/DatabasePictureRepository'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { productType, inStock, status } = req.query;
    
    const filters: any = {};
    
    if (productType && typeof productType === 'string') {
      filters.productType = productType;
    }
    
    if (inStock !== undefined && typeof inStock === 'string') {
      filters.inStock = inStock === 'true';
    }
    
    if (status && typeof status === 'string' && (status === 'AVAILABLE' || status === 'NOT_AVAILABLE')) {
      filters.status = status;
    }

    const pictureRepository = new DatabasePictureRepository()
    const pictures = await pictureRepository.findAll(Object.keys(filters).length > 0 ? filters : undefined)
    
    return res.status(200).json({ pictures })
  } catch (error) {
    console.error('Error fetching public pictures:', error)
    return res.status(500).json({ error: 'Failed to fetch pictures' })
  }
}

export default handler