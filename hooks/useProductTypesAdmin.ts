import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type ProductType = {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  isActive: boolean;
};

export const productTypeKeys = {
  all: ["product-types"] as const,
};

export function useProductTypes() {
  return useQuery({
    queryKey: productTypeKeys.all,
    queryFn: async (): Promise<ProductType[]> => {
      const response = await fetch("/api/admin/product-types");
      if (!response.ok) {
        throw new Error("Failed to fetch product types");
      }
      const data = await response.json();
      return data.productTypes || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateProductType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { displayName: string; description: string }) => {
      const response = await fetch("/api/admin/product-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Error al crear el tipo de producto");
      }
      return payload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productTypeKeys.all });
    },
  });
}

export function useUpdateProductType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { displayName: string; description: string };
    }) => {
      const response = await fetch(`/api/admin/product-types/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(
          payload.error || "Error al actualizar el tipo de producto",
        );
      }
      return payload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productTypeKeys.all });
    },
  });
}

export function useDeleteProductType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/product-types/${id}`, {
        method: "DELETE",
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(
          payload.error || "Error al eliminar el tipo de producto",
        );
      }
      return payload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productTypeKeys.all });
    },
  });
}
