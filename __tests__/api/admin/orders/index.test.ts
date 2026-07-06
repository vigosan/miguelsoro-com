// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the dependencies module
vi.mock("@/infra/dependencies", () => ({
  getAllOrders: {
    execute: vi.fn(),
  },
}));

import handler from "@/pages/api/admin/orders/index";
import { getAllOrders } from "@/infra/dependencies";
import {
  createMockRequest,
  createAuthedRequest,
  createMockResponse,
} from "../../simple-helpers";

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

  describe("auth", () => {
    it("should return 401 without a valid session (protects customer PII)", async () => {
      const req = createMockRequest("GET");
      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(mockGetAllOrders.execute).not.toHaveBeenCalled();
    });
  });

  describe("GET", () => {
    it("should return orders list", async () => {
      const req = await createAuthedRequest("GET");
      const res = createMockResponse();

      mockGetAllOrders.execute.mockResolvedValue(mockOrderSummaries);

      await handler(req, res);

      expect(mockGetAllOrders.execute).toHaveBeenCalledWith();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        orders: mockOrderSummaries,
        total: mockOrderSummaries.length,
      });
    });

    it("should return empty array when no orders", async () => {
      const req = await createAuthedRequest("GET");
      const res = createMockResponse();

      mockGetAllOrders.execute.mockResolvedValue([]);

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ orders: [], total: 0 });
    });

    it("should return 500 when error occurs", async () => {
      const req = await createAuthedRequest("GET");
      const res = createMockResponse();

      mockGetAllOrders.execute.mockRejectedValue(new Error("Database error"));

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch orders",
      });
    });
  });

  describe("filters and pagination", () => {
    const orderAt = (n: number, status: string, name: string) => ({
      ...mockOrderSummaries[0],
      id: `order-${n}`,
      orderNumber: `MS-ABC23${n}`,
      customerName: name,
      status,
    });

    beforeEach(() => {
      mockGetAllOrders.execute.mockResolvedValue([
        orderAt(1, "PAID", "Ana García"),
        orderAt(2, "PENDING", "Bruno Pérez"),
        orderAt(3, "PAID", "Carla Ruiz"),
      ] as any);
    });

    it("filters by status server-side", async () => {
      const req = await createAuthedRequest("GET", undefined, {
        status: "PAID",
      });
      const res = createMockResponse();

      await handler(req, res);

      const payload = res.json.mock.calls[0][0];
      expect(payload.orders).toHaveLength(2);
      expect(payload.total).toBe(2);
    });

    it("searches across name, email, id, and order number", async () => {
      const req = await createAuthedRequest("GET", undefined, {
        search: "ms-abc232",
      });
      const res = createMockResponse();

      await handler(req, res);

      const payload = res.json.mock.calls[0][0];
      expect(payload.orders).toHaveLength(1);
      expect(payload.orders[0].customerName).toBe("Bruno Pérez");
    });

    it("paginates when a page param is present instead of shipping every order", async () => {
      const req = await createAuthedRequest("GET", undefined, {
        page: "2",
        limit: "2",
      });
      const res = createMockResponse();

      await handler(req, res);

      const payload = res.json.mock.calls[0][0];
      expect(payload.orders).toHaveLength(1);
      expect(payload).toMatchObject({ total: 3, page: 2, totalPages: 2 });
    });
  });

  describe("non-GET methods", () => {
    it("should return 405 for POST method", async () => {
      const req = await createAuthedRequest("POST", {});
      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({ error: "Method not allowed" });
    });
  });
});
