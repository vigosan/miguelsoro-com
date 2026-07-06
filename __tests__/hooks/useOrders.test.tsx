import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/test/renderWithProviders";
import { useOrder, useUpdateOrderStatus } from "@/hooks/useOrders";

const fetchMock = vi.fn();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createQueryClient()}>
    {children}
  </QueryClientProvider>
);

describe("useOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("unwraps the { order } envelope the admin API returns", async () => {
    // The hook existed but parsed the raw body, so the first page to adopt
    // it would have rendered undefined fields.
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        order: { id: "order-1", orderNumber: "MS-ABC234", status: "PAID" },
      }),
    });

    const { result } = renderHook(() => useOrder("order-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toMatchObject({
      id: "order-1",
      orderNumber: "MS-ABC234",
    });
  });
});

describe("useUpdateOrderStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("sends PUT (the endpoint rejects PATCH with 405) and surfaces the warning", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        order: { id: "order-1", status: "SHIPPED" },
        warning: "sin factura",
      }),
    });

    const { result } = renderHook(() => useUpdateOrderStatus(), { wrapper });

    const data = await result.current.mutateAsync({
      id: "order-1",
      status: "SHIPPED",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/orders/order-1",
      expect.objectContaining({ method: "PUT" }),
    );
    expect(data.warning).toBe("sin factura");
    expect(data.order.status).toBe("SHIPPED");
  });
});
