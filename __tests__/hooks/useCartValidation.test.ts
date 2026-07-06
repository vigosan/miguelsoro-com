import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

const stableCartState = vi.hoisted(() => ({
  items: [
    {
      variantId: "variant-1",
      productId: "product-1",
      title: "Obra de prueba",
      price: 20,
      quantity: 1,
    },
  ],
  isOpen: false,
}));

vi.mock("@/contexts/CartContext", () => ({
  useCart: () => ({ state: stableCartState }),
}));

import { useCartValidation } from "@/hooks/useCartValidation";

const validVariant = {
  id: "variant-1",
  price: 2000,
  stock: 5,
  status: "AVAILABLE",
  product: { title: "Obra de prueba" },
};

const fetchMock = vi.fn();

const respondWith = (shippingSettings: {
  standardRate: number;
  freeShippingThreshold: number;
}) => {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ variants: [validVariant], shippingSettings }),
  });
};

describe("useCartValidation shipping changes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("clears the shipping_changed issue once the new settings become the baseline", async () => {
    // A single admin change of shipping rates must warn once, not re-flag
    // on every revalidation forever (which blocks checkout permanently).
    respondWith({ standardRate: 500, freeShippingThreshold: 0 });
    const { result } = renderHook(() => useCartValidation());
    await waitFor(() => expect(result.current.lastChecked).not.toBeNull());
    expect(result.current.isValid).toBe(true);

    respondWith({ standardRate: 700, freeShippingThreshold: 0 });
    await act(async () => {
      await result.current.validateCart();
    });
    expect(
      result.current.issues.some((i) => i.type === "shipping_changed"),
    ).toBe(true);

    respondWith({ standardRate: 700, freeShippingThreshold: 0 });
    await act(async () => {
      await result.current.validateCart();
    });
    expect(
      result.current.issues.some((i) => i.type === "shipping_changed"),
    ).toBe(false);
    expect(result.current.isValid).toBe(true);
  });

  it("stays usable when validation itself fails (server-side checks are authoritative)", async () => {
    // Blocking checkout on a validation blip would cost sales; stock and
    // prices are enforced server-side in create-order regardless.
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "boom" }),
    });

    const { result } = renderHook(() => useCartValidation());
    await waitFor(() => expect(result.current.lastChecked).not.toBeNull());

    expect(result.current.isValid).toBe(true);
  });
});
