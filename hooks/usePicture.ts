import { useQuery } from "@tanstack/react-query";
import { Product } from "@/domain/product";
import { BasicPicture } from "@/domain/picture";

export function usePicture(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: ["picture", idOrSlug],
    queryFn: async (): Promise<BasicPicture> => {
      const response = await fetch(
        `/api/products/${encodeURIComponent(idOrSlug!)}`,
      );

      if (response.status === 404) {
        throw new Error("Picture not found");
      }

      if (!response.ok) {
        throw new Error("Failed to fetch picture");
      }

      const data = await response.json();
      const product: Product = data.product;

      // Convert product to legacy picture format for compatibility
      const legacyPicture: BasicPicture = {
        id: product.id,
        title: product.title,
        description: product.description || "",
        price: product.basePrice,
        size: product.productType.displayName,
        slug: product.slug,
      };

      return legacyPicture;
    },
    enabled: !!idOrSlug,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
