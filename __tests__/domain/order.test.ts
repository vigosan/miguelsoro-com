import { describe, it, expect } from "vitest";
import {
  calculateOrderTotal,
  generateOrderNumber,
  orderReference,
  orderStatusMeta,
  OrderStatus,
} from "@/domain/order";
import type { OrderItem } from "@/domain/order";

const item = (total: number): OrderItem => ({
  id: "item-1",
  orderId: "order-1",
  variantId: "variant-1",
  quantity: 1,
  price: total,
  total,
  createdAt: new Date("2024-01-01"),
});

describe("calculateOrderTotal", () => {
  it("adds 21% Spanish VAT to the subtotal", () => {
    const result = calculateOrderTotal([item(2000)]);

    expect(result.subtotal).toBe(2000);
    expect(result.tax).toBe(420);
  });

  it("charges no shipping when no rate is configured", () => {
    const result = calculateOrderTotal([item(2000)]);

    expect(result.shipping).toBe(0);
    expect(result.total).toBe(2420);
  });

  it("always charges the configured rate when free shipping is disabled (threshold 0)", () => {
    // The admin UI documents threshold 0 as "0 para desactivar envío
    // gratuito": with a configured rate the store must always collect it.
    const result = calculateOrderTotal([item(2000)], 500, 0);

    expect(result.shipping).toBe(500);
    expect(result.total).toBe(2920);
  });

  it("always charges the configured rate when no threshold is provided", () => {
    const result = calculateOrderTotal([item(2000)], 500);

    expect(result.shipping).toBe(500);
    expect(result.total).toBe(2920);
  });

  it("charges the rate while the subtotal is below the threshold", () => {
    const result = calculateOrderTotal([item(2000)], 500, 10000);

    expect(result.shipping).toBe(500);
    expect(result.total).toBe(2920);
  });

  it("grants free shipping once the subtotal reaches the threshold", () => {
    const result = calculateOrderTotal([item(10000)], 500, 10000);

    expect(result.shipping).toBe(0);
    expect(result.total).toBe(12100);
  });
});

describe("generateOrderNumber", () => {
  it("produces short references a customer can read over the phone", () => {
    for (let i = 0; i < 200; i++) {
      expect(generateOrderNumber()).toMatch(/^MS-[2-9A-HJKMNP-Z]{6}$/);
    }
  });

  it("never uses characters that are easy to confuse when dictated (0/O, 1/I/L)", () => {
    for (let i = 0; i < 200; i++) {
      expect(generateOrderNumber()).not.toMatch(/[01OIL]/);
    }
  });
});

describe("orderReference", () => {
  it("prefers the short order number when the order has one", () => {
    expect(
      orderReference({ orderNumber: "MS-7KQ2M4", id: "5b9f930f-a0ee" }),
    ).toBe("MS-7KQ2M4");
  });

  it("falls back to a short tail of the UUID for orders created before the migration", () => {
    expect(
      orderReference({
        orderNumber: null,
        id: "5b9f930f-a0ee-49d1-a271-afb177447382",
      }),
    ).toBe("#77447382");
  });
});

describe("orderStatusMeta", () => {
  it("defines a label and badge style for every order status", () => {
    // Three admin pages kept their own diverging copies: SHIPPED was purple
    // in the list but blue in the detail view. One source of truth.
    for (const status of Object.values(OrderStatus)) {
      const meta = orderStatusMeta(status);
      expect(meta.label).toBeTruthy();
      expect(meta.badgeClasses).toMatch(/bg-.+text-/);
    }
  });

  it("falls back gracefully for unknown statuses instead of crashing the page", () => {
    const meta = orderStatusMeta("SOMETHING_NEW");
    expect(meta.label).toBe("SOMETHING_NEW");
    expect(meta.badgeClasses).toContain("bg-gray-100");
  });
});
