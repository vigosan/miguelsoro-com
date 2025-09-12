import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const orders = await prisma.order.findMany({
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      productType: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      // Transform orders to match expected format
      const transformedOrders = orders.map(order => ({
        id: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        totalAmount: order.total,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        items: order.items.map(item => ({
          id: item.id,
          productTitle: item.variant.product.title,
          productType: item.variant.product.productType.displayName,
          quantity: item.quantity,
          unitPrice: item.price
        }))
      }))
      
      return res.status(200).json({ orders: transformedOrders })
    } catch (error) {
      console.error('Error fetching orders:', error)
      return res.status(500).json({ error: 'Failed to fetch orders' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}