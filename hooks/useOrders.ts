import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { OrderWithDetails } from "@/infra/OrderRepository";

// Types
export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type Order = {
  id: string;
  orderNumber?: string | null;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  items: Array<{
    id: string;
    productTitle: string;
    productType: string;
    quantity: number;
    unitPrice: number;
  }>;
};

export type OrdersPage = {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
};

export type OrderStats = {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  statusCounts: Record<string, number>;
};

// Query keys
export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...orderKeys.lists(), { filters }] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  stats: () => [...orderKeys.all, "stats"] as const,
};

// Custom hooks
export function useOrders(filters?: {
  status?: OrderStatus;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: orderKeys.list(filters || {}),
    queryFn: async (): Promise<OrdersPage> => {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.search) params.append("search", filters.search);
      params.append("page", String(filters?.page ?? 1));
      params.append("limit", String(filters?.limit ?? 20));

      const response = await fetch(`/api/admin/orders?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      return {
        orders: data.orders || [],
        total: data.total ?? 0,
        page: data.page ?? 1,
        totalPages: data.totalPages ?? 1,
      };
    },
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async (): Promise<OrderWithDetails> => {
      const response = await fetch(`/api/admin/orders/${id}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      // API returns { order: {...} }, so extract the order object
      const data = await response.json();
      return data.order;
    },
    enabled: !!id,
  });
}

export function useOrderStats() {
  return useQuery({
    queryKey: orderKeys.stats(),
    queryFn: async (): Promise<OrderStats> => {
      const response = await fetch("/api/admin/orders/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch order stats");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: OrderStatus;
    }): Promise<{ order: OrderWithDetails; warning?: string }> => {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update order status");
      }

      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch orders
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      // Update specific order in cache
      queryClient.setQueryData(orderKeys.detail(variables.id), data.order);
    },
  });
}
