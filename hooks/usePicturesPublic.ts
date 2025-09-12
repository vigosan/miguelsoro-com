import { useQuery } from '@tanstack/react-query';
import { Picture } from '@/domain/picture';

export const publicPictureKeys = {
  all: ['public-pictures'] as const,
  lists: (filters?: any) => [...publicPictureKeys.all, 'list', filters] as const,
  details: () => [...publicPictureKeys.all, 'detail'] as const,
  detail: (slug: string) => [...publicPictureKeys.details(), slug] as const,
};

export function usePicturesPublic(filters?: {
  productType?: string;
  inStock?: boolean;
  status?: 'AVAILABLE' | 'SOLD';
}) {
  return useQuery({
    queryKey: publicPictureKeys.lists(filters),
    queryFn: async (): Promise<Picture[]> => {
      const searchParams = new URLSearchParams();
      
      if (filters?.productType) {
        searchParams.append('productType', filters.productType);
      }
      
      if (filters?.inStock !== undefined) {
        searchParams.append('inStock', filters.inStock.toString());
      }
      
      if (filters?.status) {
        searchParams.append('status', filters.status);
      }

      const url = `/api/pictures${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch pictures');
      }
      const data = await response.json();
      return data.pictures || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function usePicturePublic(slug: string | undefined) {
  return useQuery({
    queryKey: publicPictureKeys.detail(slug || ''),
    queryFn: async (): Promise<Picture> => {
      if (!slug) throw new Error('No slug provided');
      const response = await fetch(`/api/pictures/${slug}`);
      if (!response.ok) {
        throw new Error('Failed to fetch picture');
      }
      return response.json();
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}