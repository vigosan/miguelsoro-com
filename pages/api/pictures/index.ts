import type { NextApiRequest, NextApiResponse } from 'next'
import { DatabasePictureRepository } from '@/infra/DatabasePictureRepository'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const pictureRepository = new DatabasePictureRepository()
    const pictures = await pictureRepository.findAll()
    
    return res.status(200).json({ pictures })
  } catch (error) {
    console.error('Error fetching public pictures:', error)
    return res.status(500).json({ error: 'Failed to fetch pictures' })
  }
}

export default handler