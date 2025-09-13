import { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '@/utils/supabase/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productId } = req.query;

    if (!productId || typeof productId !== 'string') {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const supabase = createAdminClient();

    const { data: variants, error } = await supabase
      .from('product_variants')
      .select(`
        id,
        price,
        status,
        stock,
        products!inner(id)
      `)
      .eq('products.id', productId)
      .gt('stock', 0); // Only variants with stock > 0

    if (error) {
      console.error('Error fetching variants:', error);
      return res.status(500).json({ error: 'Failed to fetch variants' });
    }

    res.status(200).json(variants || []);

  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}