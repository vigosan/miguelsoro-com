import { useQuery } from '@tanstack/react-query';
import { Picture } from '@/domain/picture';

export const publicPictureKeys = {
  all: ['public-pictures'] as const,
  lists: () => [...publicPictureKeys.all, 'list'] as const,
  details: () => [...publicPictureKeys.all, 'detail'] as const,
  detail: (slug: string) => [...publicPictureKeys.details(), slug] as const,
};

export function usePicturesPublic() {
  return useQuery({
    queryKey: publicPictureKeys.lists(),
    queryFn: async (): Promise<Picture[]> => {
      const response = await fetch('/api/pictures');
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