// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/infra/dependencies", () => ({
  findOrderByIdForAdmin: {
    execute: vi.fn(),
  },
  updateOrderStatus: {
    execute: vi.fn(),
  },
}));

vi.mock("@/lib/email", () => ({
  sendOrderStatusEmail: vi.fn(),
}));

import handler from "@/pages/api/admin/orders/[id]";
import { updateOrderStatus } from "@/infra/dependencies";
import { sendOrderStatusEmail } from "@/lib/email";
import {
  createMockRequest,
  createAuthedRequest,
  createMockResponse,
  mockOrder,
} from "../../simple-helpers";

const mockUpdateOrderStatus = vi.mocked(updateOrderStatus);
const mockSendOrderStatusEmail = vi.mocked(sendOrderStatusEmail);

describe("/api/admin/orders/[id] PUT", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateOrderStatus.execute.mockResolvedValue({
      ...mockOrder,
      status: "PROCESSING",
    });
  });

  it("returns 401 without a valid session", async () => {
    const req = createMockRequest(
      "PUT",
      { status: "PROCESSING" },
      { id: "order-123" },
    );
    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockUpdateOrderStatus.execute).not.toHaveBeenCalled();
  });

  it("notifies the customer by email when the order moves to PROCESSING", async () => {
    const req = await createAuthedRequest(
      "PUT",
      { status: "PROCESSING" },
      { id: "order-123" },
    );
    const res = createMockResponse();

    await handler(req, res);

    expect(mockUpdateOrderStatus.execute).toHaveBeenCalledWith(
      "order-123",
      "PROCESSING",
    );
    expect(mockSendOrderStatusEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        customerName: "John Doe",
        customerEmail: "john@example.com",
        pictureTitle: "Test Artwork",
        orderId: "order-123",
      }),
      "PROCESSING",
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("notifies the customer by email when the order moves to SHIPPED", async () => {
    mockUpdateOrderStatus.execute.mockResolvedValue({
      ...mockOrder,
      status: "SHIPPED",
    });
    const req = await createAuthedRequest(
      "PUT",
      { status: "SHIPPED" },
      { id: "order-123" },
    );
    const res = createMockResponse();

    await handler(req, res);

    expect(mockSendOrderStatusEmail).toHaveBeenCalledWith(
      expect.objectContaining({ customerEmail: "john@example.com" }),
      "SHIPPED",
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it.each(["DELIVERED", "CANCELLED"])(
    "does not email the customer for %s",
    async (status) => {
      mockUpdateOrderStatus.execute.mockResolvedValue({
        ...mockOrder,
        status,
      });
      const req = await createAuthedRequest(
        "PUT",
        { status },
        { id: "order-123" },
      );
      const res = createMockResponse();

      await handler(req, res);

      expect(mockSendOrderStatusEmail).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    },
  );

  it("still updates the order when the email fails, so a mail outage never blocks fulfilment", async () => {
    mockSendOrderStatusEmail.mockRejectedValue(new Error("Resend down"));
    const req = await createAuthedRequest(
      "PUT",
      { status: "PROCESSING" },
      { id: "order-123" },
    );
    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 400 when the status is invalid", async () => {
    mockUpdateOrderStatus.execute.mockRejectedValue(
      new Error("Invalid status"),
    );
    const req = await createAuthedRequest(
      "PUT",
      { status: "BOGUS" },
      { id: "order-123" },
    );
    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockSendOrderStatusEmail).not.toHaveBeenCalled();
  });
});
