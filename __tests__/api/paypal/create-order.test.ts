// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the dependencies module
vi.mock("@/infra/dependencies", () => ({
  productVariantRepository: {
    findAvailableByIds: vi.fn(),
  },
  createOrder: {
    execute: vi.fn(),
  },
}));

vi.mock("@/lib/paypal", () => ({
  ordersController: {
    createOrder: vi.fn(),
  },
}));

vi.mock("@/services/databaseShippingSettings", () => ({
  getShippingSettings: vi.fn(),
}));

import handler from "@/pages/api/paypal/create-order";
import { productVariantRepository, createOrder } from "@/infra/dependencies";
import { ordersController } from "@/lib/paypal";
import { getShippingSettings } from "@/services/databaseShippingSettings";
import {
  createMockRequest,
  createMockResponse,
  mockVariant,
} from "../simple-helpers";

const mockFindAvailableByIds = vi.mocked(
  productVariantRepository.findAvailableByIds,
);
const mockCreateOrderUseCase = vi.mocked(createOrder.execute);
const mockPayPalCreateOrder = vi.mocked(ordersController.createOrder);
const mockGetShippingSettings = vi.mocked(getShippingSettings);

const requestBody = {
  customerEmail: "john@example.com",
  customerName: "John Doe",
  customerPhone: "123456789",
  shippingAddress: "123 Main St",
  items: [{ variantId: "variant-1", quantity: 1 }],
};

const paypalOrderResponse = {
  id: "paypal-123",
  status: "CREATED",
  links: [{ rel: "approve", href: "https://paypal.com/approve/123" }],
};

describe("/api/paypal/create-order", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindAvailableByIds.mockResolvedValue([mockVariant] as any);
    mockPayPalCreateOrder.mockResolvedValue({
      body: paypalOrderResponse,
    } as any);
    mockCreateOrderUseCase.mockResolvedValue({
      id: "order-123",
      total: 2920,
    } as any);
  });

  describe("shipping", () => {
    it("charges the customer the same shipping the checkout displays", async () => {
      // Subtotal 2000 is below the 10000 threshold, so the configured
      // 500-cent rate must reach PayPal — otherwise the store silently
      // eats the shipping fee the customer saw on screen.
      mockGetShippingSettings.mockResolvedValue({
        id: "shipping-1",
        standardRate: 500,
        freeShippingThreshold: 10000,
        isActive: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      });

      const req = createMockRequest("POST", requestBody);
      const res = createMockResponse();

      await handler(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const paypalRequest = mockPayPalCreateOrder.mock.calls[0][0].body;
      const amount = paypalRequest.purchaseUnits![0].amount!;
      expect(amount.breakdown!.shipping!.value).toBe("5.00");
      expect(amount.value).toBe("29.20"); // 2000 subtotal + 420 tax + 500 shipping

      expect(mockCreateOrderUseCase).toHaveBeenCalledWith(
        expect.objectContaining({ shipping: 500, total: 2920 }),
      );
    });

    it("keeps shipping free once the subtotal reaches the threshold", async () => {
      mockGetShippingSettings.mockResolvedValue({
        id: "shipping-1",
        standardRate: 500,
        freeShippingThreshold: 1500,
        isActive: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      });

      const req = createMockRequest("POST", requestBody);
      const res = createMockResponse();

      await handler(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const paypalRequest = mockPayPalCreateOrder.mock.calls[0][0].body;
      expect(
        paypalRequest.purchaseUnits![0].amount!.breakdown!.shipping!.value,
      ).toBe("0.00");
      expect(mockCreateOrderUseCase).toHaveBeenCalledWith(
        expect.objectContaining({ shipping: 0, total: 2420 }),
      );
    });

    it("charges no shipping when no settings are configured", async () => {
      mockGetShippingSettings.mockResolvedValue(null);

      const req = createMockRequest("POST", requestBody);
      const res = createMockResponse();

      await handler(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockCreateOrderUseCase).toHaveBeenCalledWith(
        expect.objectContaining({ shipping: 0, total: 2420 }),
      );
    });
  });
});
