import { NextApiRequest, NextApiResponse } from 'next';
import { SupabaseNewsRepository } from '@/infra/SupabaseNewsRepository';
import { CreateNewsData } from '@/domain/news';

const repository = new SupabaseNewsRepository();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        // Get all news or only published based on query param
        const showAll = req.query.all === 'true';
        const news = showAll 
          ? await repository.findAll()
          : await repository.findPublished();
        return res.status(200).json(news);

      case 'POST':
        // Create new news item
        const createData: CreateNewsData = req.body;
        const newNews = await repository.create(createData);
        return res.status(201).json(newNews);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('News API error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}