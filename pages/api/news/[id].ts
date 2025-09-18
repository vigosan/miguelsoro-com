import { NextApiRequest, NextApiResponse } from 'next';
import { SupabaseNewsRepository } from '@/infra/SupabaseNewsRepository';
import { UpdateNewsData } from '@/domain/news';

const repository = new SupabaseNewsRepository();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid news ID' });
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get single news item
        const news = await repository.findById(id);
        if (!news) {
          return res.status(404).json({ error: 'News not found' });
        }
        return res.status(200).json(news);

      case 'PUT':
      case 'PATCH':
        // Update news item
        console.log('Update request body:', req.body);
        console.log('Update ID:', id);
        
        const updateData: UpdateNewsData = req.body;
        
        // Ensure date is in correct format
        if (updateData.date && typeof updateData.date === 'string') {
          // If date doesn't include time, add it
          if (!updateData.date.includes('T')) {
            updateData.date = updateData.date;
          }
        }
        
        const updatedNews = await repository.update(id, updateData);
        if (!updatedNews) {
          return res.status(404).json({ error: 'News not found' });
        }
        
        // Revalidate the news page
        try {
          await res.revalidate('/news');
        } catch (err) {
          console.warn('Failed to revalidate /news:', err);
        }
        
        return res.status(200).json(updatedNews);

      case 'DELETE':
        // Delete news item
        const deleted = await repository.delete(id);
        if (!deleted) {
          return res.status(404).json({ error: 'News not found' });
        }
        
        // Revalidate the news page
        try {
          await res.revalidate('/news');
        } catch (err) {
          console.warn('Failed to revalidate /news:', err);
        }
        
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'PATCH', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('News API error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}