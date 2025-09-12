import { vi } from 'vitest'

// Mock Supabase client (for testing)
export const supabaseMock = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  single: vi.fn(),
  order: vi.fn().mockReturnThis(),
}

// Mock data structures
export const mockOrder = {
  id: 'order-123',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerPhone: '123456789',
  shippingAddress: '123 Main St',
  status: 'PAID',
  subtotal: 2000,
  tax: 200,
  shipping: 500,
  total: 2700,
  paypalOrderId: 'paypal-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  items: [
    {
      id: 'item-1',
      variantId: 'variant-1',
      quantity: 1,
      price: 2000,
      total: 2000,
      variant: {
        id: 'variant-1',
        price: 2000,
        status: 'AVAILABLE',
        product: {
          id: 'product-1',
          title: 'Test Artwork',
          slug: 'test-artwork',
          productType: {
            id: 'type-1',
            displayName: 'Canvas Print'
          },
          images: [
            {
              id: 'image-1',
              isPrimary: true,
              url: '/test-image.webp'
            }
          ]
        }
      }
    }
  ]
}

export const mockVariant = {
  id: 'variant-1',
  price: 2000,
  status: 'AVAILABLE',
  product: {
    id: 'product-1',
    title: 'Test Artwork',
    images: [
      {
        id: 'image-1',
        isPrimary: true,
        url: '/test-image.webp'
      }
    ]
  }
}

export const mockOrderStats = {
  totalOrders: 10,
  completedOrders: 5,
  pendingOrders: 3,
  totalRevenue: 15000
}

// Mock PayPal SDK
export const mockOrdersController = {
  createOrder: vi.fn(),
  captureOrder: vi.fn(),
}

export const mockPayPalOrder = {
  id: 'paypal-123',
  status: 'COMPLETED',
  links: [
    { rel: 'approve', href: 'https://paypal.com/approve/123' }
  ]
}

// Mock email functions
export const mockEmailFunctions = {
  sendOrderConfirmationEmail: vi.fn().mockResolvedValue(undefined),
  sendAdminNotificationEmail: vi.fn().mockResolvedValue(undefined),
}

// Setup function to reset all mocks
export const resetMocks = () => {
  vi.clearAllMocks()
}

// Mock Next.js API request/response
export const createMockRequest = (method: string, body?: any, query?: any) => ({
  method,
  body,
  query: query || {},
})

export const createMockResponse = () => {
  const res: any = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}