// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetOrderInvoice } from "@/application/orderUseCases";
import type { OrderRepository } from "@/infra/OrderRepository";
import { mockOrder } from "../api/simple-helpers";

const invoicedAt = new Date("2026-07-06T10:00:00Z");

const createMockRepository = (order: unknown) =>
  ({
    findByIdForAdmin: vi.fn().mockResolvedValue(order),
    assignInvoiceNumber: vi
      .fn()
      .mockResolvedValue({ invoiceNumber: 7, invoicedAt }),
  }) as unknown as OrderRepository;

describe("GetOrderInvoice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("assigns the next sequential number the first time a paid order is invoiced", async () => {
    const repository = createMockRepository({ ...mockOrder, status: "PAID" });
    const useCase = new GetOrderInvoice(repository);

    const result = await useCase.execute("order-123");

    expect(repository.assignInvoiceNumber).toHaveBeenCalledWith("order-123");
    expect(result.invoiceNumber).toBe(7);
    expect(result.invoicedAt).toEqual(invoicedAt);
    expect(result.order.id).toBe("order-123");
  });

  it("reuses the stored number on later views so the invoice never changes", async () => {
    const repository = createMockRepository({
      ...mockOrder,
      status: "SHIPPED",
      invoiceNumber: 3,
      invoicedAt,
    });
    const useCase = new GetOrderInvoice(repository);

    const result = await useCase.execute("order-123");

    expect(repository.assignInvoiceNumber).not.toHaveBeenCalled();
    expect(result.invoiceNumber).toBe(3);
  });

  it.each(["PENDING", "CANCELLED"])(
    "refuses to invoice a %s order because no payment backs it",
    async (status) => {
      const repository = createMockRepository({ ...mockOrder, status });
      const useCase = new GetOrderInvoice(repository);

      await expect(useCase.execute("order-123")).rejects.toThrow(
        "Order is not invoiceable",
      );
      expect(repository.assignInvoiceNumber).not.toHaveBeenCalled();
    },
  );

  it("still serves an already-issued invoice for a refunded order", async () => {
    const repository = createMockRepository({
      ...mockOrder,
      status: "REFUNDED",
      invoiceNumber: 5,
      invoicedAt,
    });
    const useCase = new GetOrderInvoice(repository);

    const result = await useCase.execute("order-123");

    expect(result.invoiceNumber).toBe(5);
  });

  it("throws when the order does not exist", async () => {
    const repository = createMockRepository(null);
    const useCase = new GetOrderInvoice(repository);

    await expect(useCase.execute("order-123")).rejects.toThrow(
      "Order not found",
    );
  });
});
