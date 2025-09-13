import { NextApiRequest, NextApiResponse } from 'next';
import { productVariantRepository } from '../../../infra/dependencies';
import { getShippingSettings } from '../../../services/databaseShippingSettings';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { variantIds } = req.body;

    if (!variantIds || !Array.isArray(variantIds)) {
      return res.status(400).json({ error: 'Invalid variant IDs' });
    }

    // Get current state of all variants in the cart
    const variants = await productVariantRepository.findAvailableByIds(variantIds);
    
    // Also get unavailable variants to detect products that are no longer available
    const allVariants = await productVariantRepository.findByIds(variantIds);

    // Get current shipping settings
    const shippingSettings = await getShippingSettings();

    res.status(200).json({
      variants: allVariants.map(variant => ({
        id: variant.id,
        price: variant.price,
        stock: variant.stock,
        status: variant.status,
        product: {
          title: variant.product?.title || 'Unknown Product'
        }
      })),
      shippingSettings: {
        standardRate: shippingSettings?.standardRate || 0,
        freeShippingThreshold: shippingSettings?.freeShippingThreshold || 0
      }
    });

  } catch (error) {
    console.error('Error validating cart:', error);
    res.status(500).json({ error: 'Failed to validate cart' });
  }
}