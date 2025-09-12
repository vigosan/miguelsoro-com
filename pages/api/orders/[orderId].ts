import { NextApiRequest, NextApiResponse } from 'next';
import { findOrderById } from '../../../infra/dependencies';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId } = req.query;

    const order = await findOrderById.execute(orderId as string);
    res.status(200).json(order);

  } catch (error) {
    console.error('Error fetching order:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Order ID is required') {
        return res.status(400).json({ error: 'Order ID is required' });
      }
      if (error.message === 'Order not found') {
        return res.status(404).json({ error: 'Order not found' });
      }
    }
    
    res.status(500).json({ error: 'Failed to fetch order' });
  }
}