import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid order ID' })
  }

  if (req.method === 'GET') {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
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
        }
      })

      if (!order) {
        return res.status(404).json({ error: 'Order not found' })
      }

      // Transform order to match expected format
      const transformedOrder = {
        id: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        shippingAddress: order.shippingAddress,
        status: order.status,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        total: order.total,
        paypalOrderId: order.paypalOrderId,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        items: order.items.map(item => ({
          id: item.id,
          productTitle: item.variant.product.title,
          productType: item.variant.product.productType.displayName,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        }))
      }
      
      return res.status(200).json({ order: transformedOrder })
    } catch (error) {
      console.error('Error fetching order:', error)
      return res.status(500).json({ error: 'Failed to fetch order' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { status } = req.body

      if (!status) {
        return res.status(400).json({ error: 'Status is required' })
      }

      const validStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' })
      }

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status }
      })
      
      return res.status(200).json({ order: updatedOrder })
    } catch (error) {
      console.error('Error updating order:', error)
      return res.status(500).json({ error: 'Failed to update order' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}