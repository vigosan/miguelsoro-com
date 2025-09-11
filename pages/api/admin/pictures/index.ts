import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const pictures = await prisma.picture.findMany({
        orderBy: { createdAt: 'desc' }
      })
      return res.status(200).json({ pictures })
    } catch (error) {
      console.error('Error fetching pictures:', error)
      return res.status(500).json({ error: 'Failed to fetch pictures' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, description, price, size, slug, imageUrl, status } = req.body

      // Validate required fields
      if (!title || !price || !size || !slug) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      // Check if slug already exists
      const existingPicture = await prisma.picture.findUnique({
        where: { slug }
      })

      if (existingPicture) {
        return res.status(400).json({ error: 'Slug already exists' })
      }

      const picture = await prisma.picture.create({
        data: {
          title,
          description,
          price: parseInt(price),
          size,
          slug,
          imageUrl: imageUrl || '',
          status: status || 'AVAILABLE'
        }
      })

      return res.status(201).json({ picture })
    } catch (error) {
      console.error('Error creating picture:', error)
      return res.status(500).json({ error: 'Failed to create picture' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}