import { useState, useEffect } from "react";
import { Product } from "@/domain/product";

// Legacy Picture type for compatibility
type Picture = {
  id: string;
  title: string;
  description: string;
  price: number;
  size: string;
  slug: string;
};

export function usePicture(idOrSlug: string | undefined) {
  const [picture, setPicture] = useState<Picture | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPicture = async () => {
      if (!idOrSlug) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/products/${encodeURIComponent(idOrSlug)}`);
        
        if (response.status === 404) {
          setPicture(undefined);
          return;
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch picture');
        }
        
        const data = await response.json();
        const product: Product = data.product;
        
        // Convert product to legacy picture format for compatibility
        const legacyPicture: Picture = {
          id: product.id,
          title: product.title,
          description: product.description || '',
          price: product.basePrice,
          size: product.productType.displayName,
          slug: product.slug,
        };
        
        setPicture(legacyPicture);
      } catch (error) {
        console.error('Error fetching picture:', error);
        setPicture(undefined);
      } finally {
        setLoading(false);
      }
    };

    fetchPicture();
  }, [idOrSlug]);

  return picture;
}
