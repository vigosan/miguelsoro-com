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

import handler from "@/pages/api/admin/orders/[id]/invoice";
import { getOrderInvoice } from "@/infra/dependencies";
import { getGeneralSettings } from "@/services/databaseGeneralSettings";
import { generateInvoicePdf } from "@/lib/invoice";
import {
  createMockRequest,
  createAuthedRequest,
  createMockResponse,
  mockOrder,
} from "../../simple-helpers";

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

const createPdfResponse = () => {
  const res = createMockResponse();
  res.setHeader = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
};

describe("/api/admin/orders/[id]/invoice GET", () => {
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
    const req = createMockRequest("GET", undefined, { id: "order-123" });
    const res = createPdfResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockGetOrderInvoice.execute).not.toHaveBeenCalled();
  });

  it("serves the invoice PDF inline with the seller's fiscal data", async () => {
    const req = await createAuthedRequest("GET", undefined, {
      id: "order-123",
    });
    const res = createPdfResponse();

    await handler(req, res);

    expect(mockGeneratePdf).toHaveBeenCalledWith({
      order: expect.objectContaining({ id: "order-123" }),
      seller: {
        name: "Miguel Soro Art",
        nif: "12345678Z",
        address: "Calle Mayor 1",
      },
      invoiceNumber: 7,
      invoicedAt: new Date("2026-07-06"),
    });
    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/pdf",
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Disposition",
      'inline; filename="factura-MS-0007.pdf"',
    );
    expect(res.send).toHaveBeenCalledWith(Buffer.from("%PDF-fake"));
  });

  it("returns 409 when fiscal data is missing so no invalid invoice is ever issued", async () => {
    mockGetGeneralSettings.mockResolvedValue({
      ...settingsWithFiscalData,
      businessNif: null,
    });
    const req = await createAuthedRequest("GET", undefined, {
      id: "order-123",
    });
    const res = createPdfResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(mockGetOrderInvoice.execute).not.toHaveBeenCalled();
    expect(mockGeneratePdf).not.toHaveBeenCalled();
  });

  it("returns 400 for orders without a payment behind them", async () => {
    mockGetOrderInvoice.execute.mockRejectedValue(
      new Error("Order is not invoiceable"),
    );
    const req = await createAuthedRequest("GET", undefined, {
      id: "order-123",
    });
    const res = createPdfResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 404 when the order does not exist", async () => {
    mockGetOrderInvoice.execute.mockRejectedValue(new Error("Order not found"));
    const req = await createAuthedRequest("GET", undefined, {
      id: "order-123",
    });
    const res = createPdfResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
