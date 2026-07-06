import { createAdminClient } from "@/utils/supabase/server";
import {
  OrderRepository,
  OrderWithDetails,
  OrderSummary,
  OrderStats,
  CreateOrderData,
  ProductVariantRepository,
  ProductVariant,
} from "./OrderRepository";
import { v4 as uuidv4 } from "uuid";
import { generateOrderNumber } from "../domain/order";

export class DatabaseOrderRepository implements OrderRepository {
  private getClient() {
    return createAdminClient();
  }

  async findById(id: string): Promise<OrderWithDetails | null> {
    const supabase = this.getClient();

    const { data: order, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items(
          id,
          variantId,
          quantity,
          price,
          total,
          product_variants(
            id,
            price,
            status,
            products(
              id,
              title,
              slug,
              product_types(
                id,
                displayName
              ),
              product_images(
                id,
                isPrimary,
                url
              )
            )
          )
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error fetching order by id:", error);
      throw new Error(`Failed to fetch order: ${error.message}`);
    }

    return this.mapToOrderWithDetails(order);
  }

  async findAll(): Promise<OrderSummary[]> {
    const supabase = this.getClient();

    const { data: orders, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        orderNumber,
        customerName,
        customerEmail,
        total,
        status,
        createdAt,
        order_items(
          id,
          quantity,
          price,
          product_variants(
            products(
              title,
              product_types(
                displayName
              )
            )
          )
        )
      `,
      )
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("Error fetching all orders:", error);
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    return (orders || []).map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber ?? null,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      totalAmount: order.total,
      status: order.status,
      createdAt: order.createdAt,
      items: (order.order_items || []).map((item: any) => ({
        id: item.id,
        productTitle: item.product_variants.products.title,
        productType: item.product_variants.products.product_types.displayName,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
    }));
  }

  async findByIdForAdmin(id: string): Promise<OrderWithDetails | null> {
    // Same as findById for now, could be extended with additional admin fields
    return this.findById(id);
  }

  async updateStatus(id: string, status: string): Promise<OrderWithDetails> {
    const supabase = this.getClient();

    const { error } = await supabase
      .from("orders")
      .update({
        status,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating order status:", error);
      throw new Error(`Failed to update order: ${error.message}`);
    }

    const updatedOrder = await this.findById(id);
    if (!updatedOrder) {
      throw new Error("Order not found after update");
    }

    return updatedOrder;
  }

  async assignInvoiceNumber(id: string): Promise<{
    invoiceNumber: number;
    invoicedAt: Date;
  }> {
    const supabase = this.getClient();

    const { data, error } = await supabase
      .rpc("assign_invoice_number", { order_id: id })
      .single();

    if (error || !data) {
      console.error("Error assigning invoice number:", error);
      throw new Error("Failed to assign invoice number");
    }

    const row = data as { invoiceNumber: number; invoicedAt: string };
    return {
      invoiceNumber: row.invoiceNumber,
      invoicedAt: new Date(row.invoicedAt),
    };
  }

  async getStats(): Promise<OrderStats> {
    const supabase = this.getClient();

    const { data: orders, error } = await supabase
      .from("orders")
      .select("status, total");

    if (error) {
      console.error("Error getting order stats:", error);
      throw new Error(`Failed to get stats: ${error.message}`);
    }

    const PAID_THROUGH = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

    return (orders || []).reduce(
      (stats, order) => {
        stats.totalOrders += 1;
        stats.statusCounts[order.status] =
          (stats.statusCounts[order.status] || 0) + 1;
        if (order.status === "DELIVERED") stats.completedOrders += 1;
        if (order.status === "PAID" || order.status === "PROCESSING") {
          stats.pendingOrders += 1;
        }
        if (PAID_THROUGH.includes(order.status)) {
          stats.totalRevenue += order.total || 0;
        }
        return stats;
      },
      {
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        statusCounts: {} as Record<string, number>,
      },
    );
  }

  async create(data: CreateOrderData): Promise<OrderWithDetails> {
    const supabase = this.getClient();

    // Create order. The short customer-facing reference is random, so retry
    // with a fresh one on the (rare) unique-constraint collision.
    const orderId = uuidv4();
    const now = new Date().toISOString();
    const MAX_ATTEMPTS = 3;
    let order: { id: string } | null = null;

    for (let attempt = 0; attempt < MAX_ATTEMPTS && !order; attempt++) {
      const { data: inserted, error: orderError } = await supabase
        .from("orders")
        .insert({
          id: orderId,
          orderNumber: generateOrderNumber(),
          customerEmail: data.customerEmail,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          shippingAddress: data.shippingAddress,
          paypalOrderId: data.paypalOrderId,
          status: data.status,
          subtotal: data.subtotal,
          tax: data.tax,
          shipping: data.shipping,
          total: data.total,
          createdAt: now,
          updatedAt: now,
        })
        .select()
        .single();

      if (orderError) {
        const isOrderNumberCollision =
          orderError.code === "23505" &&
          orderError.message.includes("orderNumber");
        if (isOrderNumberCollision && attempt < MAX_ATTEMPTS - 1) {
          continue;
        }
        console.error("Error creating order:", orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      order = inserted;
    }

    if (!order) {
      throw new Error("Failed to create order: could not assign order number");
    }

    // Create order items
    const orderItems = data.items.map((item) => ({
      id: uuidv4(),
      ...item,
      orderId: order.id,
      createdAt: now,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    // Return the complete order
    const completeOrder = await this.findById(order.id);
    if (!completeOrder) {
      throw new Error("Order not found after creation");
    }

    return completeOrder;
  }

  async markPaidByPayPalId(paypalOrderId: string): Promise<{
    order: OrderWithDetails;
    alreadyPaid: boolean;
  }> {
    const supabase = this.getClient();

    // The guarded update is the single source of truth: only the caller whose
    // update touches the row transitions the order to PAID (alreadyPaid=false)
    // and may decrement stock. A concurrent capture/webhook sees zero affected
    // rows and must not decrement again.
    const { data: updated, error } = await supabase
      .from("orders")
      .update({
        status: "PAID",
        updatedAt: new Date().toISOString(),
      })
      .eq("paypalOrderId", paypalOrderId)
      .neq("status", "PAID")
      .select("id");

    if (error) {
      console.error("Error marking order as paid:", error);
      throw new Error(`Failed to mark order as paid: ${error.message}`);
    }

    const alreadyPaid = !updated || updated.length === 0;

    let orderId = updated?.[0]?.id;
    if (!orderId) {
      const { data: existing, error: findError } = await supabase
        .from("orders")
        .select("id")
        .eq("paypalOrderId", paypalOrderId)
        .single();

      if (findError) {
        console.error("Error finding order by PayPal ID:", findError);
        throw new Error(`Failed to find order: ${findError.message}`);
      }
      orderId = existing.id;
    }

    const order = await this.findById(orderId);
    if (!order) {
      throw new Error("Order not found after marking as paid");
    }

    return { order, alreadyPaid };
  }

  async updateManyByPayPalId(
    paypalOrderId: string,
    status: string,
    fromStatuses?: string[],
  ): Promise<void> {
    const supabase = this.getClient();

    let query = supabase
      .from("orders")
      .update({
        status,
        updatedAt: new Date().toISOString(),
      })
      .eq("paypalOrderId", paypalOrderId);

    if (fromStatuses && fromStatuses.length > 0) {
      query = query.in("status", fromStatuses);
    }

    const { error } = await query;

    if (error) {
      console.error("Error updating many orders by PayPal ID:", error);
      throw new Error(`Failed to update orders: ${error.message}`);
    }
  }

  async setCaptureId(paypalOrderId: string, captureId: string): Promise<void> {
    const supabase = this.getClient();

    const { error } = await supabase
      .from("orders")
      .update({ captureId, updatedAt: new Date().toISOString() })
      .eq("paypalOrderId", paypalOrderId);

    if (error) {
      console.error("Error saving capture id:", error);
      // Non-fatal: the payment already succeeded. Refunds for this order will
      // just be unavailable until the id is backfilled.
    }
  }

  async findByPayPalId(
    paypalOrderId: string,
  ): Promise<OrderWithDetails | null> {
    const supabase = this.getClient();

    const { data, error } = await supabase
      .from("orders")
      .select("id")
      .eq("paypalOrderId", paypalOrderId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error finding order by PayPal ID:", error);
      return null;
    }

    return data ? this.findById(data.id) : null;
  }

  private mapToOrderWithDetails(dbOrder: any): OrderWithDetails {
    return {
      id: dbOrder.id,
      orderNumber: dbOrder.orderNumber ?? null,
      customerName: dbOrder.customerName,
      customerEmail: dbOrder.customerEmail,
      customerPhone: dbOrder.customerPhone,
      shippingAddress: dbOrder.shippingAddress,
      status: dbOrder.status,
      subtotal: dbOrder.subtotal,
      tax: dbOrder.tax,
      shipping: dbOrder.shipping,
      total: dbOrder.total,
      paypalOrderId: dbOrder.paypalOrderId,
      captureId: dbOrder.captureId,
      invoiceNumber: dbOrder.invoiceNumber,
      invoicedAt: dbOrder.invoicedAt ? new Date(dbOrder.invoicedAt) : null,
      createdAt: new Date(dbOrder.createdAt),
      updatedAt: new Date(dbOrder.updatedAt),
      items: (dbOrder.order_items || []).map((item: any) => ({
        id: item.id,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        variant: {
          id: item.product_variants.id,
          price: item.product_variants.price,
          status: item.product_variants.status,
          product: {
            id: item.product_variants.products.id,
            title: item.product_variants.products.title,
            slug: item.product_variants.products.slug,
            productType: item.product_variants.products.product_types
              ? {
                  id: item.product_variants.products.product_types.id,
                  displayName:
                    item.product_variants.products.product_types.displayName,
                }
              : undefined,
            images: (item.product_variants.products.product_images || [])
              .filter((img: any) => img.isPrimary)
              .map((img: any) => ({
                id: img.id,
                isPrimary: img.isPrimary,
                url: img.url,
              })),
          },
        },
      })),
    };
  }
}

export class DatabaseProductVariantRepository
  implements ProductVariantRepository
{
  private getClient() {
    return createAdminClient();
  }

  async findAvailableByIds(ids: string[]): Promise<ProductVariant[]> {
    const supabase = this.getClient();

    const { data: variants, error } = await supabase
      .from("product_variants")
      .select(
        `
        id,
        price,
        status,
        stock,
        products!inner(
          id,
          title,
          product_images!inner(
            id,
            isPrimary,
            url
          )
        )
      `,
      )
      .in("id", ids)
      .gt("stock", 0) // Use stock instead of status
      .eq("products.product_images.isPrimary", true);

    if (error) {
      console.error("Error fetching available variants:", error);
      throw new Error(`Failed to fetch variants: ${error.message}`);
    }

    return (variants || []).map((variant: any) => ({
      id: variant.id,
      price: variant.price,
      status: variant.status,
      stock: variant.stock,
      product: {
        id: variant.products.id,
        title: variant.products.title,
        images: (variant.products.product_images || []).map((img: any) => ({
          id: img.id,
          isPrimary: img.isPrimary,
          url: img.url,
        })),
      },
    }));
  }

  async findByIds(ids: string[]): Promise<ProductVariant[]> {
    const supabase = this.getClient();

    const { data: variants, error } = await supabase
      .from("product_variants")
      .select(
        `
        id,
        price,
        status,
        stock,
        products!inner(
          id,
          title,
          product_images!inner(
            id,
            isPrimary,
            url
          )
        )
      `,
      )
      .in("id", ids)
      .eq("products.product_images.isPrimary", true);

    if (error) {
      console.error("Error fetching variants:", error);
      throw new Error(`Failed to fetch variants: ${error.message}`);
    }

    return (variants || []).map((variant: any) => ({
      id: variant.id,
      price: variant.price,
      status: variant.status,
      stock: variant.stock,
      product: {
        id: variant.products.id,
        title: variant.products.title,
        images: (variant.products.product_images || []).map((img: any) => ({
          id: img.id,
          isPrimary: img.isPrimary,
          url: img.url,
        })),
      },
    }));
  }

  async decrementStock(id: string, quantity: number): Promise<void> {
    await this.adjustStock(id, (stock) => ({ stock: stock - quantity }));
  }

  async incrementStock(id: string, quantity: number): Promise<void> {
    await this.adjustStock(id, (stock) => {
      const newStock = stock + quantity;
      return {
        stock: newStock,
        ...(newStock > 0 ? { status: "AVAILABLE" } : {}),
      };
    });
  }

  // Compare-and-swap: the update only applies while the stock still holds the
  // value we read, so two concurrent payments can never overwrite each other's
  // decrement. On conflict we re-read and retry with the fresh value.
  private async adjustStock(
    id: string,
    buildUpdate: (currentStock: number) => { stock: number; status?: string },
  ): Promise<void> {
    const supabase = this.getClient();
    const MAX_ATTEMPTS = 3;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const { data: variant, error: getError } = await supabase
        .from("product_variants")
        .select("stock")
        .eq("id", id)
        .single();

      if (getError) {
        console.error("Error getting variant stock:", getError);
        throw new Error(`Failed to get variant: ${getError.message}`);
      }

      const { data: updated, error } = await supabase
        .from("product_variants")
        .update(buildUpdate(variant.stock))
        .eq("id", id)
        .eq("stock", variant.stock)
        .select("id");

      if (error) {
        console.error("Error updating stock:", error);
        throw new Error(`Failed to update stock: ${error.message}`);
      }

      if (updated && updated.length > 0) {
        return;
      }
    }

    throw new Error(
      `Failed to update stock for variant ${id} after ${MAX_ATTEMPTS} concurrent modifications`,
    );
  }

  async markOutOfStockIfNeeded(id: string): Promise<void> {
    const supabase = this.getClient();

    const { data: variant, error: getError } = await supabase
      .from("product_variants")
      .select("stock")
      .eq("id", id)
      .single();

    if (getError) {
      console.error("Error getting variant for stock check:", getError);
      throw new Error(`Failed to get variant: ${getError.message}`);
    }

    if (variant && variant.stock <= 0) {
      const { error } = await supabase
        .from("product_variants")
        .update({ status: "OUT_OF_STOCK" })
        .eq("id", id);

      if (error) {
        console.error("Error marking out of stock:", error);
        throw new Error(`Failed to mark out of stock: ${error.message}`);
      }
    }
  }
}
