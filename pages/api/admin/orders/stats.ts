import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Get total orders count
      const totalOrders = await prisma.order.count()

      // Get completed orders count
      const completedOrders = await prisma.order.count({
        where: {
          status: 'DELIVERED'
        }
      })

      // Get pending orders count (PENDING, PAID, SHIPPED)
      const pendingOrders = await prisma.order.count({
        where: {
          status: {
            in: ['PENDING', 'PAID', 'SHIPPED']
          }
        }
      })

      // Get total revenue from delivered orders
      const revenueResult = await prisma.order.aggregate({
        where: {
          status: 'DELIVERED'
        },
        _sum: {
          total: true
        }
      })

      const totalRevenue = revenueResult._sum.total || 0

      const stats = {
        totalOrders,
        completedOrders,
        pendingOrders,
        totalRevenue
      }
      
      return res.status(200).json(stats)
    } catch (error) {
      console.error('Error fetching order stats:', error)
      return res.status(500).json({ error: 'Failed to fetch order stats' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}