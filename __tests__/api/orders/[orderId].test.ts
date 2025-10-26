import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the dependencies module
vi.mock("@/infra/dependencies", () => ({
  findOrderById: {
    execute: vi.fn(),
  },
}));

import handler from "@/pages/api/orders/[orderId]";
import { findOrderById } from "@/infra/dependencies";
import {
  mockOrder,
  createMockRequest,
  createMockResponse,
} from "../simple-helpers";

const mockFindOrderById = vi.mocked(findOrderById);

describe("/api/orders/[orderId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET", () => {
    it("should return order when found", async () => {
      const req = createMockRequest("GET", null, { orderId: "order-123" });
      const res = createMockResponse();

      mockFindOrderById.execute.mockResolvedValue(mockOrder);

      await handler(req, res);

      expect(mockFindOrderById.execute).toHaveBeenCalledWith("order-123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockOrder);
    });

    it("should return 404 when order not found", async () => {
      const req = createMockRequest("GET", null, { orderId: "nonexistent" });
      const res = createMockResponse();

      mockFindOrderById.execute.mockRejectedValue(new Error("Order not found"));

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Order not found" });
    });

    it("should return 400 when orderId is invalid", async () => {
      const req = createMockRequest("GET", null, { orderId: "invalid" });
      const res = createMockResponse();

      mockFindOrderById.execute.mockRejectedValue(
        new Error("Order ID is required"),
      );

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Order ID is required" });
    });

    it("should return 500 when unexpected error occurs", async () => {
      const req = createMockRequest("GET", null, { orderId: "order-123" });
      const res = createMockResponse();

      mockFindOrderById.execute.mockRejectedValue(
        new Error("Database connection failed"),
      );

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch order" });
    });
  });

  describe("non-GET methods", () => {
    it("should return 405 for POST method", async () => {
      const req = createMockRequest("POST", {}, { orderId: "order-123" });
      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({ error: "Method not allowed" });
    });
  });
});
