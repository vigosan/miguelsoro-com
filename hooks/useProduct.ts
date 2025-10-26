import { useQuery } from "@tanstack/react-query";
import { Product } from "@/domain/product";

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async (): Promise<Product> => {
      const response = await fetch(
        `/api/products/${encodeURIComponent(slug!)}`,
      );

      if (response.status === 404) {
        throw new Error("Product not found");
      }

      if (!response.ok) {
        throw new Error("Failed to fetch product");
      }

      const data = await response.json();
      return data.product;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
