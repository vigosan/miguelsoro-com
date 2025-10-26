import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the dependencies module
vi.mock("@/infra/dependencies", () => ({
  getAllOrders: {
    execute: vi.fn(),
  },
}));

import handler from "@/pages/api/admin/orders/index";
import { getAllOrders } from "@/infra/dependencies";
import { createMockRequest, createMockResponse } from "../../simple-helpers";

const mockGetAllOrders = vi.mocked(getAllOrders);

const mockOrderSummaries = [
  {
    id: "order-123",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    totalAmount: 2700,
    status: "PAID",
    createdAt: "2024-01-01T00:00:00.000Z",
    items: [
      {
        id: "item-1",
        productTitle: "Test Artwork",
        productType: "Canvas Print",
        quantity: 1,
        unitPrice: 2000,
      },
    ],
  },
];

describe("/api/admin/orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET", () => {
    it("should return orders list", async () => {
      const req = createMockRequest("GET");
      const res = createMockResponse();

      mockGetAllOrders.execute.mockResolvedValue(mockOrderSummaries);

      await handler(req, res);

      expect(mockGetAllOrders.execute).toHaveBeenCalledWith();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ orders: mockOrderSummaries });
    });

    it("should return empty array when no orders", async () => {
      const req = createMockRequest("GET");
      const res = createMockResponse();

      mockGetAllOrders.execute.mockResolvedValue([]);

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ orders: [] });
    });

    it("should return 500 when error occurs", async () => {
      const req = createMockRequest("GET");
      const res = createMockResponse();

      mockGetAllOrders.execute.mockRejectedValue(new Error("Database error"));

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch orders",
      });
    });
  });

  describe("non-GET methods", () => {
    it("should return 405 for POST method", async () => {
      const req = createMockRequest("POST", {});
      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({ error: "Method not allowed" });
    });
  });
});
