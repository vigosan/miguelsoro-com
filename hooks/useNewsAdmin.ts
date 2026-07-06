import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { News, CreateNewsData, UpdateNewsData } from "@/domain/news";

export const newsKeys = {
  all: ["news-admin"] as const,
};

export function useNewsAdmin() {
  const queryClient = useQueryClient();

  const {
    data: news = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: newsKeys.all,
    queryFn: async (): Promise<News[]> => {
      const response = await fetch("/api/news?all=true");
      if (!response.ok) {
        throw new Error("Failed to fetch news");
      }
      return response.json();
    },
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: newsKeys.all });

  const createMutation = useMutation({
    mutationFn: async (data: CreateNewsData): Promise<News> => {
      const response = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create news");
      }
      return response.json();
    },
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateNewsData;
    }): Promise<News> => {
      const response = await fetch(`/api/news/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update news");
      }
      return response.json();
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/news/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete news");
      }
    },
    onSuccess: invalidate,
  });

  const createNews = async (data: CreateNewsData): Promise<News | null> => {
    try {
      return await createMutation.mutateAsync(data);
    } catch {
      return null;
    }
  };

  const updateNews = async (
    id: string,
    data: UpdateNewsData,
  ): Promise<News | null> => {
    try {
      return await updateMutation.mutateAsync({ id, data });
    } catch {
      return null;
    }
  };

  const deleteNews = async (id: string): Promise<boolean> => {
    try {
      await deleteMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };

  return {
    news,
    loading,
    error: queryError instanceof Error ? queryError.message : null,
    createNews,
    updateNews,
    deleteNews,
    refreshNews: refetch,
  };
}
