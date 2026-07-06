import React, { useState } from "react";
import { describe, it, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen, act } from "@/test/renderWithProviders";
import { CartProvider, useCart } from "@/contexts/CartContext";

const captured: Array<ReturnType<typeof useCart>> = [];

function Probe() {
  captured.push(useCart());
  return null;
}

function Harness() {
  const [, setTick] = useState(0);
  return (
    <>
      <button
        type="button"
        data-testid="force-rerender"
        onClick={() => setTick((n) => n + 1)}
      >
        rerender
      </button>
      <CartProvider>
        <Probe />
      </CartProvider>
    </>
  );
}

describe("CartContext value identity", () => {
  beforeEach(() => {
    captured.length = 0;
    window.localStorage.clear();
  });

  it("keeps the same context value across unrelated parent re-renders", async () => {
    // A new value object per render (e.g. on every route change) forces
    // every useCart consumer app-wide to re-render for nothing.
    const user = userEvent.setup({ delay: null });
    render(<Harness />);

    await user.click(screen.getByTestId("force-rerender"));

    const first = captured[0];
    const last = captured[captured.length - 1];
    expect(last).toBe(first);
  });

  it("provides a fresh value when the cart actually changes", async () => {
    render(<Harness />);
    const first = captured[captured.length - 1];

    act(() => {
      first.addItem({
        variantId: "variant-1",
        productId: "product-1",
        title: "Obra",
        price: 20,
        imageUrl: null,
      } as any);
    });

    const last = captured[captured.length - 1];
    expect(last).not.toBe(first);
    expect(last.state.items).toHaveLength(1);
  });
});
