import { useState, useEffect } from "react";
import { Product, getProductImagePath } from "@/domain/product";

// Legacy Picture type for compatibility
export type Picture = {
  id: string;
  title: string;
  description: string;
  price: number;
  size: string;
  slug: string;
};

export function usePictures() {
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPictures = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        
        // Convert products to legacy picture format for compatibility
        const legacyPictures: Picture[] = data.products.map((product: Product) => ({
          id: product.id,
          title: product.title,
          description: product.description || '',
          price: product.basePrice,
          size: product.productType.displayName,
          slug: product.slug,
        }));
        
        setPictures(legacyPictures);
      } catch (error) {
        console.error('Error fetching pictures:', error);
        setPictures([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPictures();
  }, []);

  return pictures;
}
