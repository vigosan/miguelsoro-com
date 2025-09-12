import type { NextApiRequest, NextApiResponse } from 'next';
import { getShippingSettings } from '@/services/shippingSettings';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const settings = await getShippingSettings();
      
      if (!settings) {
        return res.status(404).json({ error: 'No shipping settings found' });
      }

      res.status(200).json(settings);
    } catch (error) {
      console.error('Error fetching shipping settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}