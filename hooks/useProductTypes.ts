import { useQuery } from '@tanstack/react-query';

export const productTypeKeys = {
  all: ['product-types'] as const,
  public: () => [...productTypeKeys.all, 'public'] as const,
};

export function useProductTypesPublic() {
  return useQuery({
    queryKey: productTypeKeys.public(),
    queryFn: async (): Promise<string[]> => {
      // Get all pictures and extract unique product types
      const response = await fetch('/api/pictures');
      if (!response.ok) {
        throw new Error('Failed to fetch pictures');
      }
      const data = await response.json();
      const pictures = data.pictures || [];
      
      // Extract unique product type names
      const uniqueTypes = [...new Set(
        pictures.map((picture: any) => picture.productTypeName).filter(Boolean)
      )];
      
      return uniqueTypes.sort();
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}