import { useState, useEffect, useCallback } from "react";
import { News, CreateNewsData, UpdateNewsData } from "@/domain/news";

export function useNewsAdmin() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/news?all=true");

      if (!response.ok) {
        throw new Error("Failed to fetch news");
      }

      const newsData = await response.json();
      setNews(newsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading news");
    } finally {
      setLoading(false);
    }
  }, []);

  const createNews = useCallback(
    async (data: CreateNewsData): Promise<News | null> => {
      try {
        const response = await fetch("/api/news", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Failed to create news");
        }

        const newNews = await response.json();
        await loadNews(); // Reload data
        return newNews;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error creating news");
        return null;
      }
    },
    [loadNews],
  );

  const updateNews = useCallback(
    async (id: string, data: UpdateNewsData): Promise<News | null> => {
      try {
        const response = await fetch(`/api/news/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Failed to update news");
        }

        const updatedNews = await response.json();
        await loadNews(); // Reload data
        return updatedNews;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error updating news");
        return null;
      }
    },
    [loadNews],
  );

  const deleteNews = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/news/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete news");
        }

        await loadNews(); // Reload data
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error deleting news");
        return false;
      }
    },
    [loadNews],
  );

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  return {
    news,
    loading,
    error,
    createNews,
    updateNews,
    deleteNews,
    refreshNews: loadNews,
  };
}
