import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid picture ID' })
  }

  if (req.method === 'GET') {
    try {
      const picture = await prisma.picture.findUnique({
        where: { id }
      })

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
      const { title, description, price, size, slug, imageUrl, status } = req.body

      // Check if picture exists
      const existingPicture = await prisma.picture.findUnique({
        where: { id }
      })

      if (!existingPicture) {
        return res.status(404).json({ error: 'Picture not found' })
      }

      // Check if slug is being changed and if new slug already exists
      if (slug && slug !== existingPicture.slug) {
        const slugExists = await prisma.picture.findUnique({
          where: { slug }
        })

        if (slugExists) {
          return res.status(400).json({ error: 'Slug already exists' })
        }
      }

      const picture = await prisma.picture.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(price && { price: parseInt(price) }),
          ...(size && { size }),
          ...(slug && { slug }),
          ...(imageUrl !== undefined && { imageUrl }),
          ...(status && { status })
        }
      })

      return res.status(200).json({ picture })
    } catch (error) {
      console.error('Error updating picture:', error)
      return res.status(500).json({ error: 'Failed to update picture' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Check if picture exists
      const existingPicture = await prisma.picture.findUnique({
        where: { id }
      })

      if (!existingPicture) {
        return res.status(404).json({ error: 'Picture not found' })
      }

      await prisma.picture.delete({
        where: { id }
      })

      return res.status(200).json({ message: 'Picture deleted successfully' })
    } catch (error) {
      console.error('Error deleting picture:', error)
      return res.status(500).json({ error: 'Failed to delete picture' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}