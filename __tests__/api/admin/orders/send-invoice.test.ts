// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/infra/dependencies", () => ({
  getOrderInvoice: {
    execute: vi.fn(),
  },
}));

vi.mock("@/services/databaseGeneralSettings", () => ({
  getGeneralSettings: vi.fn(),
}));

vi.mock("@/lib/invoice", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/invoice")>()),
  generateInvoicePdf: vi.fn(),
}));

vi.mock("@/lib/email", () => ({
  sendInvoiceEmail: vi.fn(),
}));

import handler from "@/pages/api/admin/orders/[id]/send-invoice";
import { getOrderInvoice } from "@/infra/dependencies";
import { getGeneralSettings } from "@/services/databaseGeneralSettings";
import { generateInvoicePdf } from "@/lib/invoice";
import { sendInvoiceEmail } from "@/lib/email";
import {
  createMockRequest,
  createAuthedRequest,
  createMockResponse,
  mockOrder,
} from "../../simple-helpers";

const mockGetOrderInvoice = vi.mocked(getOrderInvoice);
const mockGetGeneralSettings = vi.mocked(getGeneralSettings);
const mockGeneratePdf = vi.mocked(generateInvoicePdf);
const mockSendInvoiceEmail = vi.mocked(sendInvoiceEmail);

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

describe("/api/admin/orders/[id]/send-invoice POST", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetOrderInvoice.execute.mockResolvedValue({
      order: { ...mockOrder, status: "PAID" },
      invoiceNumber: 7,
      invoicedAt: new Date("2026-07-06"),
    });
    mockGetGeneralSettings.mockResolvedValue(settingsWithFiscalData);
    mockGeneratePdf.mockResolvedValue(Buffer.from("%PDF-fake"));
  });

  it("returns 401 without a valid session", async () => {
    const req = createMockRequest("POST", undefined, { id: "order-123" });
    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockSendInvoiceEmail).not.toHaveBeenCalled();
  });

  it("emails the invoice PDF to the customer", async () => {
    const req = await createAuthedRequest("POST", undefined, {
      id: "order-123",
    });
    const res = createMockResponse();

    await handler(req, res);

    expect(mockSendInvoiceEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        customerName: "John Doe",
        customerEmail: "john@example.com",
        orderId: "MS-ABC234",
      }),
      "MS-0007",
      Buffer.from("%PDF-fake"),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      invoiceNumber: "MS-0007",
      sentTo: "john@example.com",
    });
  });

  it("fails loudly when the email cannot be sent, because sending IS the operation", async () => {
    mockSendInvoiceEmail.mockRejectedValue(new Error("Resend down"));
    const req = await createAuthedRequest("POST", undefined, {
      id: "order-123",
    });
    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(502);
  });

  it("returns 409 when fiscal data is missing", async () => {
    mockGetGeneralSettings.mockResolvedValue({
      ...settingsWithFiscalData,
      businessName: null,
    });
    const req = await createAuthedRequest("POST", undefined, {
      id: "order-123",
    });
    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(mockSendInvoiceEmail).not.toHaveBeenCalled();
  });

  it("returns 400 for orders without a payment behind them", async () => {
    mockGetOrderInvoice.execute.mockRejectedValue(
      new Error("Order is not invoiceable"),
    );
    const req = await createAuthedRequest("POST", undefined, {
      id: "order-123",
    });
    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockSendInvoiceEmail).not.toHaveBeenCalled();
  });
});
