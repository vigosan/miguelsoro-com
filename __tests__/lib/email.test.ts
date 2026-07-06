// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn().mockResolvedValue({ id: "email-123" }),
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mockSend };
  },
}));

import { sendOrderStatusEmail, sendInvoiceEmail } from "@/lib/email";

const emailData = {
  customerName: "John Doe",
  customerEmail: "john@example.com",
  pictureTitle: "Test Artwork",
  picturePrice: 2000,
  orderId: "order-123",
};

describe("sendOrderStatusEmail", () => {
  beforeEach(() => {
    mockSend.mockClear();
  });

  it("tells the customer their order is underway when it moves to PROCESSING", async () => {
    await sendOrderStatusEmail(emailData, "PROCESSING");

    expect(mockSend).toHaveBeenCalledTimes(1);
    const email = mockSend.mock.calls[0][0];
    expect(email.to).toBe("john@example.com");
    expect(email.subject).toContain("order-123");
    expect(email.html).toContain("John Doe");
    expect(email.html).toContain("Test Artwork");
    expect(email.html).toContain("en marcha");
  });

  it("tells the customer their order shipped when it moves to SHIPPED", async () => {
    await sendOrderStatusEmail(emailData, "SHIPPED");

    expect(mockSend).toHaveBeenCalledTimes(1);
    const email = mockSend.mock.calls[0][0];
    expect(email.to).toBe("john@example.com");
    expect(email.subject).toContain("order-123");
    expect(email.html).toContain("enviado");
  });
});

describe("sendInvoiceEmail", () => {
  beforeEach(() => {
    mockSend.mockClear();
  });

  it("attaches the invoice PDF so the customer receives a self-contained document", async () => {
    const pdf = Buffer.from("%PDF-fake");

    await sendInvoiceEmail(emailData, "MS-0007", pdf);

    expect(mockSend).toHaveBeenCalledTimes(1);
    const email = mockSend.mock.calls[0][0];
    expect(email.to).toBe("john@example.com");
    expect(email.subject).toContain("MS-0007");
    expect(email.html).toContain("John Doe");
    expect(email.attachments).toEqual([
      { filename: "factura-MS-0007.pdf", content: pdf },
    ]);
  });
});
