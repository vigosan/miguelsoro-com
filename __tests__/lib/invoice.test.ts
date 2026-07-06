// @vitest-environment node
import { describe, it, expect } from "vitest";
import { inflateSync } from "zlib";
import { generateInvoicePdf, formatInvoiceNumber } from "@/lib/invoice";
import { mockOrder } from "../api/simple-helpers";

const extractDrawnText = (pdf: Buffer): string => {
  const raw = pdf.toString("latin1");
  const streams = [...raw.matchAll(/stream\r?\n([\s\S]*?)endstream/g)]
    .map((match) => {
      try {
        return inflateSync(Buffer.from(match[1], "latin1")).toString("latin1");
      } catch {
        return match[1];
      }
    })
    .join("\n");
  return [...streams.matchAll(/<([0-9A-Fa-f]+)>\s*Tj/g)]
    .map((match) => Buffer.from(match[1], "hex").toString("latin1"))
    .join("\n");
};

const seller = {
  name: "Miguel Soro Art S.L.",
  nif: "B12345678",
  address: "Calle Falsa 123\n46000 Valencia",
};

describe("formatInvoiceNumber", () => {
  it("pads to a stable sortable format so invoice files order correctly", () => {
    expect(formatInvoiceNumber(7)).toBe("MS-0007");
    expect(formatInvoiceNumber(12345)).toBe("MS-12345");
  });
});

describe("generateInvoicePdf", () => {
  it("produces a one-page PDF embedding invoice number, parties and amounts", async () => {
    const pdf = await generateInvoicePdf({
      order: mockOrder,
      seller,
      invoiceNumber: 7,
      invoicedAt: new Date("2026-07-06T10:00:00Z"),
    });

    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");

    const text = extractDrawnText(pdf);
    expect(text).toContain("MS-0007");
    expect(text).toContain("John Doe");
    expect(text).toContain("Miguel Soro Art S.L.");
    expect(text).toContain("B12345678");
    expect(text).toContain("Test Artwork");
  });

  it("embeds the signature logo as an image", async () => {
    const pdf = await generateInvoicePdf({
      order: mockOrder,
      seller,
      invoiceNumber: 7,
      invoicedAt: new Date("2026-07-06T10:00:00Z"),
    });

    expect(pdf.toString("latin1")).toContain("/Image");
  });

  it("shows the customer-facing order number instead of the raw database id", async () => {
    const pdf = await generateInvoicePdf({
      order: { ...mockOrder, id: "14a87447-1836-431a-a623-491676546b6e" },
      seller,
      invoiceNumber: 7,
      invoicedAt: new Date("2026-07-06T10:00:00Z"),
    });

    const text = extractDrawnText(pdf);
    expect(text).toContain("MS-ABC234");
    expect(text).not.toContain("14a87447-1836-431a-a623-491676546b6e");
  });

  it("falls back to a short id tail for orders created before order numbers existed", async () => {
    const pdf = await generateInvoicePdf({
      order: {
        ...mockOrder,
        id: "14a87447-1836-431a-a623-491676546b6e",
        orderNumber: null,
      },
      seller,
      invoiceNumber: 7,
      invoicedAt: new Date("2026-07-06T10:00:00Z"),
    });

    const text = extractDrawnText(pdf);
    expect(text).toContain("#76546B6E");
  });
});
