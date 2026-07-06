import { vi } from "vitest";

// Mock data structures
export const mockOrder = {
  id: "order-123",
  orderNumber: "MS-ABC234",
  customerName: "John Doe",
  customerEmail: "john@example.com",
  customerPhone: "123456789",
  shippingAddress: "123 Main St",
  status: "PAID",
  subtotal: 2000,
  tax: 200,
  shipping: 500,
  total: 2700,
  paypalOrderId: "paypal-123",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  items: [
    {
      id: "item-1",
      variantId: "variant-1",
      quantity: 1,
      price: 2000,
      total: 2000,
      variant: {
        id: "variant-1",
        price: 2000,
        status: "AVAILABLE",
        product: {
          id: "product-1",
          title: "Test Artwork",
          slug: "test-artwork",
          productType: {
            id: "type-1",
            displayName: "Canvas Print",
          },
          images: [
            {
              id: "image-1",
              isPrimary: true,
              url: "/test-image.webp",
            },
          ],
        },
      },
    },
  ],
};

export const mockVariant = {
  id: "variant-1",
  price: 2000,
  stock: 5,
  status: "AVAILABLE",
  product: {
    id: "product-1",
    title: "Test Artwork",
    images: [
      {
        id: "image-1",
        isPrimary: true,
        url: "/test-image.webp",
      },
    ],
  },
};

// Mock Next.js API request/response
export const createMockRequest = (
  method: string,
  body?: any,
  query?: any,
  headers?: Record<string, string>,
) => ({
  method,
  body,
  query: query || {},
  headers: headers || {},
});

// Build a request carrying a valid admin session cookie for protected endpoints.
export const createAuthedRequest = async (
  method: string,
  body?: any,
  query?: any,
) => {
  const { createSessionToken } = await import("@/lib/auth");
  const token = await createSessionToken();
  return createMockRequest(method, body, query, {
    cookie: `admin-session=${token}`,
  });
};

export const createMockResponse = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.end = vi.fn().mockReturnValue(res);
  return res;
};
