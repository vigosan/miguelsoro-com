import type { NextApiRequest, NextApiResponse } from 'next'
import { DatabasePictureRepository } from '@/infra/DatabasePictureRepository'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid picture ID' })
  }

  const pictureRepository = new DatabasePictureRepository()

  if (req.method === 'GET') {
    try {
      const picture = await pictureRepository.getPictureById(id)

      if (!picture) {
        return res.status(404).json({ error: 'Picture not found' })
      }

      return res.status(200).json({ picture })
    } catch (error) {
      console.error('Error fetching picture:', error)
      return res.status(500).json({ error: 'Failed to fetch picture' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const updateData = req.body
      
      const updatedPicture = await pictureRepository.update(id, updateData)
      
      return res.status(200).json(updatedPicture)
    } catch (error) {
      console.error('Error updating picture:', error)
      return res.status(500).json({ error: 'Failed to update picture' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const picture = await pictureRepository.getPictureById(id)

      if (!picture) {
        return res.status(404).json({ error: 'Picture not found' })
      }

      await pictureRepository.delete(id)

      return res.status(200).json({ message: 'Picture deleted successfully' })
    } catch (error) {
      console.error('Error deleting picture:', error)
      return res.status(500).json({ error: 'Failed to delete picture' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}