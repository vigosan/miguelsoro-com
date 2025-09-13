// Repository interfaces based on actual usage patterns identified

export interface OrderWithDetails {
  id: string
  customerName: string
  customerEmail: string
  customerPhone?: string | null
  shippingAddress?: string | null
  status: string
  subtotal: number
  tax: number
  shipping: number
  total: number
  paypalOrderId?: string | null
  createdAt: Date
  updatedAt: Date
  items: Array<{
    id: string
    variantId: string
    quantity: number
    price: number
    total: number
    variant: {
      id: string
      price: number
      status: string
      product: {
        id: string
        title: string
        slug: string
        productType?: {
          id: string
          displayName: string
        }
        images: Array<{
          id: string
          isPrimary: boolean
          url: string
        }>
      }
    }
  }>
}

export interface OrderSummary {
  id: string
  customerName: string
  customerEmail: string
  totalAmount: number
  status: string
  createdAt: string
  items: Array<{
    id: string
    productTitle: string
    productType: string
    quantity: number
    unitPrice: number
  }>
}

export interface OrderStats {
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  totalRevenue: number
}

export interface CreateOrderData {
  customerEmail: string
  customerName: string
  customerPhone?: string
  shippingAddress?: string
  paypalOrderId: string
  status: string
  subtotal: number
  tax: number
  shipping: number
  total: number
  items: Array<{
    variantId: string
    quantity: number
    price: number
    total: number
  }>
}

export interface OrderRepository {
  // From /api/orders/[orderId] - GET order by ID with full details
  findById(id: string): Promise<OrderWithDetails | null>
  
  // From /api/admin/orders/index - GET all orders with summary info
  findAll(): Promise<OrderSummary[]>
  
  // From /api/admin/orders/[id] - GET order by ID with admin details 
  findByIdForAdmin(id: string): Promise<OrderWithDetails | null>
  
  // From /api/admin/orders/[id] - PUT update order status
  updateStatus(id: string, status: string): Promise<OrderWithDetails>
  
  // From /api/admin/orders/stats - GET order statistics
  getStats(): Promise<OrderStats>
  
  // From /api/paypal/create-order - POST create new order
  create(data: CreateOrderData): Promise<OrderWithDetails>
  
  // From /api/paypal/capture-order, webhook - UPDATE order status by PayPal ID
  updateByPayPalId(paypalOrderId: string, status: string): Promise<OrderWithDetails>
  
  // From webhook - UPDATE multiple orders (updateMany)
  updateManyByPayPalId(paypalOrderId: string, status: string): Promise<void>
}

export interface ProductVariant {
  id: string
  price: number
  status: string
  stock?: number
  product: {
    id: string
    title: string
    images: Array<{
      id: string
      isPrimary: boolean
      url: string
    }>
  }
}

export interface ProductVariantRepository {
  // From /api/paypal/create-order - Find available variants by IDs
  findAvailableByIds(ids: string[]): Promise<ProductVariant[]>
  
  // From /api/cart/validate - Find all variants by IDs (including unavailable ones)
  findByIds(ids: string[]): Promise<ProductVariant[]>
  
  // From /api/paypal/capture-order, webhook - Update stock and status
  decrementStock(id: string, quantity: number): Promise<void>
  markOutOfStockIfNeeded(id: string): Promise<void>
}