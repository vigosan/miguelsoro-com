export interface Order {
  id: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress?: string;
  paypalOrderId?: string;
  status: OrderStatus;
  subtotal: number; // in cents
  tax: number; // in cents
  shipping: number; // in cents
  total: number; // in cents
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  quantity: number;
  price: number; // price per unit in cents
  total: number; // quantity * price in cents
  createdAt: Date;
  variant?: ProductVariant;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku?: string;
  price: number;
  stock: number;
  status: VariantStatus;
  product?: {
    id: string;
    title: string;
    slug: string;
    images: Array<{
      url: string;
      altText?: string;
      isPrimary: boolean;
    }>;
  };
}

export enum OrderStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export enum VariantStatus {
  AVAILABLE = "AVAILABLE",
  OUT_OF_STOCK = "OUT_OF_STOCK",
  DISCONTINUED = "DISCONTINUED",
}

export interface CreateOrderRequest {
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress?: string;
  items: Array<{
    variantId: string;
    quantity: number;
  }>;
}

export interface PayPalOrderData {
  id: string;
  intent: string;
  status: string;
  purchase_units: Array<{
    amount: {
      currency_code: string;
      value: string;
    };
  }>;
}

export function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

export function formatEuros(euros: number): string {
  return `€${euros.toFixed(2)}`;
}

export function calculateOrderTotal(
  items: OrderItem[],
  shippingRate?: number,
  freeShippingThreshold?: number,
): {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = Math.round(subtotal * 0.21); // 21% IVA in Spain

  // Use provided shipping settings or fallback to 0
  const standardRate = shippingRate ?? 0; // Default 0 (no shipping)
  const threshold = freeShippingThreshold ?? 0; // Default 0 (no free shipping)
  const shipping = standardRate > 0 && subtotal >= threshold ? 0 : standardRate;

  const total = subtotal + tax + shipping;

  return { subtotal, tax, shipping, total };
}
