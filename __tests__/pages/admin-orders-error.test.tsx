import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@/test/renderWithProviders";

vi.mock("@/lib/auth", () => ({
  isAuthenticated: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/infra/dependencies", () => ({
  orderRepository: {
    findAll: vi.fn(),
  },
}));

import OrdersAdmin, { getServerSideProps } from "@/pages/admin/orders/index";
import { orderRepository } from "@/infra/dependencies";

const mockFindAll = vi.mocked(orderRepository.findAll);

describe("admin orders when the database query fails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getServerSideProps reports the failure instead of faking an empty shop", async () => {
    // A DB outage rendered "No hay pedidos" — an actively misleading state
    // for a live shop (it hid today's missing-column incident completely).
    mockFindAll.mockRejectedValue(new Error("column does not exist"));

    const result = (await getServerSideProps({
      req: { headers: {} },
    } as any)) as { props: { orders: unknown[]; loadError: boolean } };

    expect(result.props.loadError).toBe(true);
    expect(result.props.orders).toEqual([]);
  });

  it("shows an explicit error state, never the empty-shop message", () => {
    render(<OrdersAdmin orders={[]} loadError />);

    expect(
      screen.getByText(/no se pudieron cargar los pedidos/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/no hay pedidos/i)).not.toBeInTheDocument();
  });

  it("still shows the normal empty state when there are genuinely no orders", () => {
    render(<OrdersAdmin orders={[]} loadError={false} />);

    expect(screen.getByText(/no hay pedidos/i)).toBeInTheDocument();
  });
});
