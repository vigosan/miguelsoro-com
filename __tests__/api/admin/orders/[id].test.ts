// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/infra/dependencies", () => ({
  findOrderByIdForAdmin: {
    execute: vi.fn(),
  },
  updateOrderStatus: {
    execute: vi.fn(),
  },
  getOrderInvoice: {
    execute: vi.fn(),
  },
}));

vi.mock("@/lib/email", () => ({
  sendOrderStatusEmail: vi.fn(),
}));

vi.mock("@/services/databaseGeneralSettings", () => ({
  getGeneralSettings: vi.fn(),
}));

vi.mock("@/lib/invoice", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/invoice")>()),
  generateInvoicePdf: vi.fn(),
}));

import handler from "@/pages/api/admin/orders/[id]";
import { updateOrderStatus, getOrderInvoice } from "@/infra/dependencies";
import { sendOrderStatusEmail } from "@/lib/email";
import { getGeneralSettings } from "@/services/databaseGeneralSettings";
import { generateInvoicePdf } from "@/lib/invoice";
import {
  createMockRequest,
  createAuthedRequest,
  createMockResponse,
  mockOrder,
} from "../../simple-helpers";

const mockUpdateOrderStatus = vi.mocked(updateOrderStatus);
const mockSendOrderStatusEmail = vi.mocked(sendOrderStatusEmail);
const mockGetOrderInvoice = vi.mocked(getOrderInvoice);
const mockGetGeneralSettings = vi.mocked(getGeneralSettings);
const mockGeneratePdf = vi.mocked(generateInvoicePdf);

const settingsWithFiscalData = {
  id: "settings-1",
  siteName: "Site",
  siteDescription: "",
  contactEmail: "info@example.com",
  businessName: "Miguel Soro Art",
  businessNif: "12345678Z",
  businessAddress: "Calle Mayor 1",
  isActive: true,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
};

describe("/api/admin/orders/[id] PUT", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateOrderStatus.execute.mockResolvedValue({
      ...mockOrder,
      status: "PROCESSING",
    });
    mockGetGeneralSettings.mockResolvedValue(settingsWithFiscalData);
    mockGetOrderInvoice.execute.mockResolvedValue({
      order: { ...mockOrder, status: "SHIPPED" },
      invoiceNumber: 7,
      invoicedAt: new Date("2026-07-06"),
    });
    mockGeneratePdf.mockResolvedValue(Buffer.from("%PDF-fake"));
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
      undefined,
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("attaches the invoice to the email when the order moves to SHIPPED", async () => {
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

    expect(mockGetOrderInvoice.execute).toHaveBeenCalledWith("order-123");
    expect(mockSendOrderStatusEmail).toHaveBeenCalledWith(
      expect.objectContaining({ customerEmail: "john@example.com" }),
      "SHIPPED",
      { formattedNumber: "MS-0007", pdf: Buffer.from("%PDF-fake") },
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.not.objectContaining({ warning: expect.anything() }),
    );
  });

  it("does not issue an invoice when the order moves to PROCESSING", async () => {
    const req = await createAuthedRequest(
      "PUT",
      { status: "PROCESSING" },
      { id: "order-123" },
    );
    const res = createMockResponse();

    await handler(req, res);

    expect(mockGetOrderInvoice.execute).not.toHaveBeenCalled();
    expect(mockSendOrderStatusEmail).toHaveBeenCalledWith(
      expect.anything(),
      "PROCESSING",
      undefined,
    );
  });

  it("still ships the order but warns the admin when fiscal data is missing", async () => {
    mockGetGeneralSettings.mockResolvedValue({
      ...settingsWithFiscalData,
      businessNif: null,
    });
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
      expect.anything(),
      "SHIPPED",
      undefined,
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ warning: expect.stringContaining("factura") }),
    );
  });

  it("still ships the order but warns the admin when invoice generation fails", async () => {
    mockGetOrderInvoice.execute.mockRejectedValue(new Error("boom"));
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
      expect.anything(),
      "SHIPPED",
      undefined,
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ warning: expect.stringContaining("factura") }),
    );
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
