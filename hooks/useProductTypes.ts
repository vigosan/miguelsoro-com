import { useQuery } from "@tanstack/react-query";

export const productTypeKeys = {
  all: ["product-types"] as const,
  public: () => [...productTypeKeys.all, "public"] as const,
};

export function useProductTypesPublic() {
  return useQuery({
    queryKey: productTypeKeys.public(),
    queryFn: async (): Promise<string[]> => {
      // Get product types from admin API
      const response = await fetch("/api/admin/product-types");
      if (!response.ok) {
        throw new Error("Failed to fetch product types");
      }
      const data = await response.json();
      const productTypes = data.productTypes || [];

      // Extract displayName and filter active ones
      return productTypes
        .filter((type: any) => type.isActive)
        .map((type: any) => type.displayName)
        .sort();
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
