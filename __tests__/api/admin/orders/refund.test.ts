// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/infra/dependencies", () => ({
  orderRepository: {
    findByIdForAdmin: vi.fn(),
    updateStatus: vi.fn(),
  },
  productVariantRepository: {
    incrementStock: vi.fn(),
  },
}));

vi.mock("@/lib/paypal", () => ({
  paymentsController: {
    refundCapturedPayment: vi.fn(),
  },
}));

vi.mock("@/lib/email", () => ({
  sendOrderStatusEmail: vi.fn(),
}));

import handler from "@/pages/api/admin/orders/[id]/refund";
import {
  orderRepository,
  productVariantRepository,
} from "@/infra/dependencies";
import { paymentsController } from "@/lib/paypal";
import { sendOrderStatusEmail } from "@/lib/email";
import {
  createAuthedRequest,
  createMockResponse,
  mockOrder,
} from "../../simple-helpers";

const mockOrderRepository = vi.mocked(orderRepository);
const mockVariantRepository = vi.mocked(productVariantRepository);
const mockRefund = vi.mocked(paymentsController.refundCapturedPayment);
const mockSendOrderStatusEmail = vi.mocked(sendOrderStatusEmail);

describe("/api/admin/orders/[id]/refund POST", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOrderRepository.findByIdForAdmin.mockResolvedValue({
      ...mockOrder,
      status: "PAID",
      captureId: "capture-1",
    });
    mockOrderRepository.updateStatus.mockResolvedValue({
      ...mockOrder,
      status: "REFUNDED",
    });
    mockVariantRepository.incrementStock.mockResolvedValue(undefined);
    mockRefund.mockResolvedValue({
      body: JSON.stringify({ id: "refund-1", status: "COMPLETED" }),
    } as never);
  });

  it("notifies the customer by email after PayPal confirms the refund", async () => {
    const req = await createAuthedRequest("POST", undefined, {
      id: "order-123",
    });
    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockSendOrderStatusEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        customerEmail: "john@example.com",
        picturePrice: 2700,
      }),
      "REFUNDED",
    );
  });

  it("still reports the refund as completed when the email fails, because the money already moved", async () => {
    mockSendOrderStatusEmail.mockRejectedValue(new Error("Resend down"));
    const req = await createAuthedRequest("POST", undefined, {
      id: "order-123",
    });
    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("does not email the customer when PayPal rejects the refund", async () => {
    mockRefund.mockResolvedValue({
      body: JSON.stringify({ id: "refund-1", status: "FAILED" }),
    } as never);
    const req = await createAuthedRequest("POST", undefined, {
      id: "order-123",
    });
    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(502);
    expect(mockSendOrderStatusEmail).not.toHaveBeenCalled();
  });
});
