import { describe, it, expect } from "vitest";
import { calculateOrderTotal } from "@/domain/order";
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
