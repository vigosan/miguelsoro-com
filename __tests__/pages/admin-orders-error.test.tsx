import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@/test/renderWithProviders";
import OrdersAdmin from "@/pages/admin/orders/index";

const fetchMock = vi.fn();

const statsPayload = {
  totalOrders: 1,
  completedOrders: 0,
  pendingOrders: 1,
  totalRevenue: 2420,
  statusCounts: { PAID: 1 },
};

const orderSummary = {
  id: "order-1",
  orderNumber: "MS-ABC234",
  customerName: "Ana García",
  customerEmail: "ana@example.com",
  totalAmount: 2420,
  status: "PAID",
  createdAt: "2026-07-01T10:00:00.000Z",
  items: [
    {
      id: "item-1",
      productTitle: "Obra",
      productType: "Cuadros",
      quantity: 1,
      unitPrice: 2000,
    },
  ],
};

const mockRoutes = (ordersResponse: () => Promise<any>) => {
  fetchMock.mockImplementation(async (url: string) => {
    if (url.startsWith("/api/admin/orders/stats")) {
      return { ok: true, json: async () => statsPayload };
    }
    if (url.startsWith("/api/admin/orders")) {
      return ordersResponse();
    }
    throw new Error(`Unexpected fetch: ${url}`);
  });
};

describe("admin orders list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("shows an explicit error state when the query fails, never a fake empty shop", async () => {
    // A DB outage once rendered "No hay pedidos" — actively misleading for
    // a live store (it completely hid a missing-column incident).
    mockRoutes(async () => ({ ok: false, json: async () => ({}) }));

    render(<OrdersAdmin />);

    expect(await screen.findByTestId("orders-load-error")).toBeInTheDocument();
    expect(screen.queryByText(/no hay pedidos/i)).not.toBeInTheDocument();
  });

  it("shows the genuine empty state when there are simply no orders", async () => {
    mockRoutes(async () => ({
      ok: true,
      json: async () => ({ orders: [], total: 0, page: 1, totalPages: 1 }),
    }));

    render(<OrdersAdmin />);

    expect(await screen.findByText(/no hay pedidos/i)).toBeInTheDocument();
  });

  it("renders the orders returned by the paginated API with full-count stats", async () => {
    mockRoutes(async () => ({
      ok: true,
      json: async () => ({
        orders: [orderSummary],
        total: 1,
        page: 1,
        totalPages: 1,
      }),
    }));

    render(<OrdersAdmin />);

    expect(
      await screen.findByText(/MS-ABC234 - Ana García/),
    ).toBeInTheDocument();
    expect(await screen.findByText("Total pedidos")).toBeInTheDocument();
  });
});
