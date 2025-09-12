import type { NextApiRequest, NextApiResponse } from 'next'
import { getOrderStats } from '../../../../infra/dependencies'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const stats = await getOrderStats.execute()
      return res.status(200).json(stats)
    } catch (error) {
      console.error('Error fetching order stats:', error)
      return res.status(500).json({ error: 'Failed to fetch order stats' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}