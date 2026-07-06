// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";

const supabaseMock = vi.hoisted(() => {
  const state = {
    responses: [] as Array<{ data: any; error: any }>,
  };

  const next = () =>
    state.responses.length > 0
      ? state.responses.shift()!
      : { data: null, error: null };

  const builder: any = {};
  for (const method of [
    "from",
    "select",
    "insert",
    "update",
    "delete",
    "eq",
    "neq",
    "in",
    "order",
    "limit",
  ]) {
    builder[method] = vi.fn(() => builder);
  }
  builder.single = vi.fn(() => Promise.resolve(next()));
  builder.then = (resolve: any, reject: any) =>
    Promise.resolve(next()).then(resolve, reject);

  return { builder, state };
});

vi.mock("@/utils/supabase/server", () => ({
  createAdminClient: () => supabaseMock.builder,
}));

import {
  DatabaseOrderRepository,
  DatabaseProductVariantRepository,
} from "@/infra/DatabaseOrderRepository";

const queueResponses = (...responses: Array<{ data: any; error: any }>) => {
  supabaseMock.state.responses = [...responses];
};

describe("DatabaseOrderRepository.markPaidByPayPalId", () => {
  let repository: DatabaseOrderRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMock.state.responses = [];
    repository = new DatabaseOrderRepository();
    vi.spyOn(repository, "findById").mockResolvedValue({
      id: "order-1",
      status: "PAID",
      items: [],
    } as any);
  });

  it("reports alreadyPaid=false only for the caller whose update touched the row", async () => {
    // The guarded UPDATE (status != PAID) is the single source of truth:
    // whoever gets an affected row is the one allowed to decrement stock.
    queueResponses({ data: [{ id: "order-1" }], error: null });

    const result = await repository.markPaidByPayPalId("paypal-123");

    expect(result.alreadyPaid).toBe(false);
    expect(supabaseMock.builder.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "PAID" }),
    );
    expect(supabaseMock.builder.neq).toHaveBeenCalledWith("status", "PAID");
  });

  it("reports alreadyPaid=true when a concurrent capture already marked it (stock decremented once)", async () => {
    // Capture endpoint and PAYMENT.CAPTURE.COMPLETED webhook race for the same
    // payment: the loser must see zero affected rows, not a stale pre-read.
    queueResponses(
      { data: [], error: null },
      { data: { id: "order-1" }, error: null },
    );

    const result = await repository.markPaidByPayPalId("paypal-123");

    expect(result.alreadyPaid).toBe(true);
  });

  it("throws when the PayPal order id is unknown", async () => {
    queueResponses(
      { data: [], error: null },
      { data: null, error: { message: "No rows found" } },
    );

    await expect(repository.markPaidByPayPalId("missing")).rejects.toThrow(
      "Failed to find order",
    );
  });
});

describe("DatabaseOrderRepository.create order number", () => {
  let repository: DatabaseOrderRepository;

  const createData = {
    customerEmail: "ana@example.com",
    customerName: "Ana García",
    paypalOrderId: "paypal-123",
    status: "PENDING",
    subtotal: 2000,
    tax: 420,
    shipping: 0,
    total: 2420,
    items: [{ variantId: "variant-1", quantity: 1, price: 2000, total: 2000 }],
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMock.state.responses = [];
    repository = new DatabaseOrderRepository();
    vi.spyOn(repository, "findById").mockResolvedValue({
      id: "order-1",
      orderNumber: "MS-ABCDEF",
    } as any);
  });

  it("assigns every new order a short customer-facing reference", async () => {
    queueResponses(
      { data: { id: "order-1" }, error: null }, // order insert
      { data: null, error: null }, // items insert
    );

    await repository.create(createData);

    const inserted = supabaseMock.builder.insert.mock.calls[0][0];
    expect(inserted.orderNumber).toMatch(/^MS-[2-9A-HJKMNP-Z]{6}$/);
  });

  it("retries with a fresh reference when the generated one collides", async () => {
    queueResponses(
      {
        data: null,
        error: {
          code: "23505",
          message:
            'duplicate key value violates unique constraint "orders_orderNumber_key"',
        },
      },
      { data: { id: "order-1" }, error: null },
      { data: null, error: null },
    );

    await repository.create(createData);

    const firstTry = supabaseMock.builder.insert.mock.calls[0][0];
    const secondTry = supabaseMock.builder.insert.mock.calls[1][0];
    expect(secondTry.orderNumber).toMatch(/^MS-[2-9A-HJKMNP-Z]{6}$/);
    expect(secondTry.orderNumber).not.toBe(firstTry.orderNumber);
  });

  it("does not mask other unique violations as collisions", async () => {
    queueResponses({
      data: null,
      error: {
        code: "23505",
        message:
          'duplicate key value violates unique constraint "orders_paypalOrderId_key"',
      },
    });

    await expect(repository.create(createData)).rejects.toThrow(
      "Failed to create order",
    );
  });
});

describe("DatabaseOrderRepository.updateManyByPayPalId", () => {
  let repository: DatabaseOrderRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMock.state.responses = [];
    repository = new DatabaseOrderRepository();
  });

  it("restricts the update to the given source statuses", async () => {
    queueResponses({ data: null, error: null });

    await repository.updateManyByPayPalId("paypal-123", "PROCESSING", [
      "PENDING",
    ]);

    expect(supabaseMock.builder.in).toHaveBeenCalledWith("status", [
      "PENDING",
    ]);
  });

  it("updates unconditionally when no source statuses are given", async () => {
    queueResponses({ data: null, error: null });

    await repository.updateManyByPayPalId("paypal-123", "REFUNDED");

    expect(supabaseMock.builder.in).not.toHaveBeenCalled();
  });
});

describe("DatabaseProductVariantRepository stock updates", () => {
  let repository: DatabaseProductVariantRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMock.state.responses = [];
    repository = new DatabaseProductVariantRepository();
  });

  it("decrements against the stock it read so concurrent buyers cannot lose an update", async () => {
    queueResponses(
      { data: { stock: 3 }, error: null },
      { data: [{ id: "variant-1" }], error: null },
    );

    await repository.decrementStock("variant-1", 1);

    expect(supabaseMock.builder.update).toHaveBeenCalledWith({ stock: 2 });
    expect(supabaseMock.builder.eq).toHaveBeenCalledWith("stock", 3);
  });

  it("retries with fresh stock when another purchase modified it first", async () => {
    queueResponses(
      { data: { stock: 3 }, error: null },
      { data: [], error: null }, // CAS lost: stock is no longer 3
      { data: { stock: 2 }, error: null },
      { data: [{ id: "variant-1" }], error: null },
    );

    await repository.decrementStock("variant-1", 1);

    expect(supabaseMock.builder.eq).toHaveBeenCalledWith("stock", 3);
    expect(supabaseMock.builder.eq).toHaveBeenCalledWith("stock", 2);
    expect(supabaseMock.builder.update).toHaveBeenLastCalledWith({ stock: 1 });
  });

  it("gives up loudly instead of writing a stale stock value", async () => {
    queueResponses(
      { data: { stock: 3 }, error: null },
      { data: [], error: null },
      { data: { stock: 2 }, error: null },
      { data: [], error: null },
      { data: { stock: 1 }, error: null },
      { data: [], error: null },
    );

    await expect(repository.decrementStock("variant-1", 1)).rejects.toThrow();
  });

  it("increments stock with the same compare-and-swap protection", async () => {
    queueResponses(
      { data: { stock: 0 }, error: null },
      { data: [{ id: "variant-1" }], error: null },
    );

    await repository.incrementStock("variant-1", 2);

    expect(supabaseMock.builder.update).toHaveBeenCalledWith(
      expect.objectContaining({ stock: 2, status: "AVAILABLE" }),
    );
    expect(supabaseMock.builder.eq).toHaveBeenCalledWith("stock", 0);
  });
});
