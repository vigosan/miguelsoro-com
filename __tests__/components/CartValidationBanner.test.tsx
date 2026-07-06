import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/renderWithProviders";
import CartValidationBanner from "@/components/cart/CartValidationBanner";
import { CartProvider } from "@/contexts/CartContext";

vi.stubGlobal("fetch", vi.fn());

const validation = {
  isValid: false,
  isLoading: false,
  issues: [
    {
      variantId: "variant-1",
      type: "price_changed" as const,
      currentValue: 25,
      cartValue: 20,
      message: "Obra: el precio ha cambiado de €20.00 a €25.00",
    },
  ],
};

describe("CartValidationBanner", () => {
  it("renders the issues it receives instead of running its own validation", () => {
    // Each banner used to call useCartValidation itself: with the drawer's
    // two responsive panels plus checkout, the same cart was validated by
    // three separate 30-second polls.
    render(
      <CartProvider>
        <CartValidationBanner validation={validation} />
      </CartProvider>,
    );

    expect(
      screen.getByText(/el precio ha cambiado de €20.00 a €25.00/i),
    ).toBeInTheDocument();
  });

  it("renders nothing when the cart is valid", () => {
    const { container } = render(
      <CartProvider>
        <CartValidationBanner
          validation={{ isValid: true, isLoading: false, issues: [] }}
        />
      </CartProvider>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
