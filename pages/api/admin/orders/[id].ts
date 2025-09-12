import type { NextApiRequest, NextApiResponse } from 'next'
import { findOrderByIdForAdmin, updateOrderStatus } from '../../../../infra/dependencies'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const order = await findOrderByIdForAdmin.execute(id as string)
      
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
          productType: item.variant.product.productType?.displayName || '',
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        }))
      }
      
      return res.status(200).json({ order: transformedOrder })
    } catch (error) {
      console.error('Error fetching order:', error)
      
      if (error instanceof Error) {
        if (error.message === 'Invalid order ID') {
          return res.status(400).json({ error: 'Invalid order ID' })
        }
        if (error.message === 'Order not found') {
          return res.status(404).json({ error: 'Order not found' })
        }
      }
      
      return res.status(500).json({ error: 'Failed to fetch order' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { status } = req.body
      const updatedOrder = await updateOrderStatus.execute(id as string, status)
      
      return res.status(200).json({ order: updatedOrder })
    } catch (error) {
      console.error('Error updating order:', error)
      
      if (error instanceof Error) {
        if (error.message === 'Status is required') {
          return res.status(400).json({ error: 'Status is required' })
        }
        if (error.message === 'Invalid status') {
          return res.status(400).json({ error: 'Invalid status' })
        }
      }
      
      return res.status(500).json({ error: 'Failed to update order' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}