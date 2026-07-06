import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@/test/renderWithProviders";

const mockPush = vi.fn().mockResolvedValue(true);
vi.mock("next/router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockClearCart = vi.fn();
vi.mock("@/contexts/CartContext", () => ({
  useCart: () => ({
    state: {
      items: [
        {
          variantId: "variant-1",
          productId: "product-1",
          title: "Obra de prueba",
          price: 20,
          quantity: 1,
          imageUrl: null,
        },
      ],
      isOpen: false,
    },
    clearCart: mockClearCart,
  }),
}));

vi.mock("@/hooks/useCartValidation", () => ({
  useCartValidation: () => ({ isValid: true, issues: [] }),
}));

vi.mock("@/components/cart/CartValidationBanner", () => ({
  default: () => null,
}));

vi.mock("@/components/Layout", () => ({
  Layout: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/lib/paypal", () => ({
  getPayPalClientConfig: () => ({ clientId: "test" }),
}));

vi.mock("@paypal/react-paypal-js", () => ({
  PayPalScriptProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="paypal-provider">{children}</div>
  ),
  PayPalButtons: ({ onApprove, disabled }: any) => (
    <button
      type="button"
      data-testid="paypal-approve"
      disabled={disabled}
      onClick={() => onApprove({ orderID: "paypal-123" })}
    >
      Pagar con PayPal
    </button>
  ),
}));

import CheckoutPage from "@/pages/checkout";

const fetchMock = vi.fn();

const fillRequiredFields = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByTestId("customer-email"), "ana@example.com");
  await user.type(screen.getByTestId("customer-name"), "Ana García");
  await user.type(screen.getByTestId("shipping-address"), "Calle Mayor 1");
};

describe("CheckoutPage PayPal SDK loading", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockImplementation(async (url: string) => {
      if (url === "/api/shipping/settings") {
        return { ok: true, json: async () => null };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
  });

  it("starts loading the SDK before the form is complete so the buttons are ready at pay time", () => {
    render(<CheckoutPage />);

    expect(screen.getByTestId("paypal-provider")).toBeInTheDocument();
    expect(screen.queryByTestId("paypal-approve")).not.toBeInTheDocument();
  });

  it("shows the buttons once the form is complete", async () => {
    const user = userEvent.setup({ delay: null });
    render(<CheckoutPage />);
    await fillRequiredFields(user);

    expect(screen.getByTestId("paypal-approve")).toBeInTheDocument();
  });
});

describe("CheckoutPage capture flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockImplementation(async (url: string) => {
      if (url === "/api/shipping/settings") {
        return { ok: true, json: async () => null };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
  });

  it("blocks any payment retry when the capture fails (money may already be taken)", async () => {
    // If the capture request dies AFTER PayPal charged the customer,
    // re-enabling the buttons invites paying twice for the same order.
    fetchMock.mockImplementation(async (url: string) => {
      if (url === "/api/shipping/settings") {
        return { ok: true, json: async () => null };
      }
      if (url === "/api/paypal/capture-order") {
        return { ok: false, json: async () => ({ error: "boom" }) };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const user = userEvent.setup({ delay: null });
    render(<CheckoutPage />);
    await fillRequiredFields(user);

    await user.click(screen.getByTestId("paypal-approve"));

    expect(await screen.findByTestId("capture-failed")).toBeInTheDocument();
    expect(screen.queryByTestId("paypal-approve")).not.toBeInTheDocument();
    expect(mockClearCart).not.toHaveBeenCalled();
  });

  it("redirects to the confirmation page when the capture succeeds", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url === "/api/shipping/settings") {
        return { ok: true, json: async () => null };
      }
      if (url === "/api/paypal/capture-order") {
        return { ok: true, json: async () => ({ orderId: "order-123" }) };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const user = userEvent.setup({ delay: null });
    render(<CheckoutPage />);
    await fillRequiredFields(user);

    await user.click(screen.getByTestId("paypal-approve"));

    expect(mockPush).toHaveBeenCalledWith(
      "/order-confirmation?orderId=order-123",
    );
    expect(mockClearCart).toHaveBeenCalled();
  });
});
