import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Picture, PictureStatus, getPictureStatus } from "@/domain/picture";

export type PictureStats = {
  totalPictures: number;
  availablePictures: number;
  notAvailablePictures: number;
};

// Query keys
export const pictureKeys = {
  all: ["pictures"] as const,
  lists: () => [...pictureKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...pictureKeys.lists(), { filters }] as const,
  details: () => [...pictureKeys.all, "detail"] as const,
  detail: (id: string) => [...pictureKeys.details(), id] as const,
  stats: () => [...pictureKeys.all, "stats"] as const,
};

// Custom hooks
export function usePictures(filters?: {
  status?: PictureStatus;
  search?: string;
}) {
  return useQuery({
    queryKey: pictureKeys.list(filters || {}),
    queryFn: async (): Promise<Picture[]> => {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.search) params.append("search", filters.search);

      const response = await fetch(`/api/admin/pictures?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch pictures");
      }
      const data = await response.json();
      return data.pictures || [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function usePicture(id: string) {
  return useQuery({
    queryKey: pictureKeys.detail(id),
    queryFn: async (): Promise<Picture> => {
      const response = await fetch(`/api/admin/pictures/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch picture");
      }
      const data = await response.json();
      // API returns { picture: {...} }, so extract the picture object
      return data.picture;
    },
    enabled: !!id,
  });
}

export function usePictureStats() {
  return useQuery({
    queryKey: pictureKeys.stats(),
    queryFn: async (): Promise<PictureStats> => {
      const response = await fetch("/api/admin/pictures");
      if (!response.ok) {
        throw new Error("Failed to fetch pictures");
      }
      const data = await response.json();
      const pictures = data.pictures || [];

      return {
        totalPictures: pictures.length,
        availablePictures: pictures.filter(
          (p: Picture) => getPictureStatus(p) === "AVAILABLE",
        ).length,
        notAvailablePictures: pictures.filter(
          (p: Picture) => getPictureStatus(p) === "NOT_AVAILABLE",
        ).length,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreatePicture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      pictureData: Omit<Picture, "id" | "createdAt" | "updatedAt">,
    ) => {
      const response = await fetch("/api/admin/pictures", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pictureData),
      });

      if (!response.ok) {
        throw new Error("Failed to create picture");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch pictures
      queryClient.invalidateQueries({ queryKey: pictureKeys.all });
    },
  });
}

export function useUpdatePicture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Picture>;
    }) => {
      const response = await fetch(`/api/admin/pictures/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update picture");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch pictures
      queryClient.invalidateQueries({ queryKey: pictureKeys.all });
      // Update specific picture in cache
      queryClient.setQueryData(pictureKeys.detail(variables.id), data);
    },
  });
}

export function useDeletePicture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/pictures/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete picture");
      }

      return { id };
    },
    onSuccess: () => {
      // Invalidate pictures list to refetch
      queryClient.invalidateQueries({ queryKey: pictureKeys.lists() });
      queryClient.invalidateQueries({ queryKey: pictureKeys.stats() });
    },
  });
}
