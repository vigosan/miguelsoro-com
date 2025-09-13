import { createAdminClient } from '@/utils/supabase/server';
import {
  OrderRepository,
  OrderWithDetails,
  OrderSummary,
  OrderStats,
  CreateOrderData,
  ProductVariantRepository,
  ProductVariant
} from './OrderRepository';
import { v4 as uuidv4 } from 'uuid';

export class DatabaseOrderRepository implements OrderRepository {
  private getClient() {
    return createAdminClient();
  }

  async findById(id: string): Promise<OrderWithDetails | null> {
    const supabase = this.getClient();

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
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
              product_images!inner(
                id,
                isPrimary,
                url
              )
            )
          )
        )
      `)
      .eq('id', id)
      .eq('product_images.isPrimary', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching order by id:', error);
      throw new Error(`Failed to fetch order: ${error.message}`);
    }

    return this.mapToOrderWithDetails(order);
  }

  async findAll(): Promise<OrderSummary[]> {
    const supabase = this.getClient();

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
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
      `)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching all orders:', error);
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    return (orders || []).map(order => ({
      id: order.id,
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
        unitPrice: item.price
      }))
    }));
  }

  async findByIdForAdmin(id: string): Promise<OrderWithDetails | null> {
    // Same as findById for now, could be extended with additional admin fields
    return this.findById(id);
  }

  async updateStatus(id: string, status: string): Promise<OrderWithDetails> {
    const supabase = this.getClient();

    const { error } = await supabase
      .from('orders')
      .update({ 
        status,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating order status:', error);
      throw new Error(`Failed to update order: ${error.message}`);
    }

    const updatedOrder = await this.findById(id);
    if (!updatedOrder) {
      throw new Error('Order not found after update');
    }

    return updatedOrder;
  }

  async getStats(): Promise<OrderStats> {
    const supabase = this.getClient();

    // Get total orders count
    const { count: totalOrders, error: totalError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      console.error('Error getting total orders:', totalError);
      throw new Error(`Failed to get stats: ${totalError.message}`);
    }

    // Get completed orders count
    const { count: completedOrders, error: completedError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'DELIVERED');

    if (completedError) {
      console.error('Error getting completed orders:', completedError);
      throw new Error(`Failed to get stats: ${completedError.message}`);
    }

    // Get pending orders count  
    const { count: pendingOrders, error: pendingError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['PENDING', 'PAID', 'SHIPPED']);

    if (pendingError) {
      console.error('Error getting pending orders:', pendingError);
      throw new Error(`Failed to get stats: ${pendingError.message}`);
    }

    // Get total revenue from delivered orders
    const { data: revenueData, error: revenueError } = await supabase
      .from('orders')
      .select('total')
      .eq('status', 'DELIVERED');

    if (revenueError) {
      console.error('Error getting revenue:', revenueError);
      throw new Error(`Failed to get stats: ${revenueError.message}`);
    }

    const totalRevenue = (revenueData || []).reduce((sum, order) => sum + (order.total || 0), 0);

    return {
      totalOrders: totalOrders || 0,
      completedOrders: completedOrders || 0,
      pendingOrders: pendingOrders || 0,
      totalRevenue
    };
  }

  async create(data: CreateOrderData): Promise<OrderWithDetails> {
    const supabase = this.getClient();

    // Create order
    const orderId = uuidv4();
    const now = new Date().toISOString();
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
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
        updatedAt: now
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    // Create order items
    const orderItems = data.items.map(item => ({
      id: uuidv4(),
      ...item,
      orderId: order.id,
      createdAt: now
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    // Return the complete order
    const completeOrder = await this.findById(order.id);
    if (!completeOrder) {
      throw new Error('Order not found after creation');
    }

    return completeOrder;
  }

  async updateByPayPalId(paypalOrderId: string, status: string): Promise<OrderWithDetails> {
    const supabase = this.getClient();

    const { error } = await supabase
      .from('orders')
      .update({ 
        status,
        updatedAt: new Date().toISOString()
      })
      .eq('paypalOrderId', paypalOrderId);

    if (error) {
      console.error('Error updating order by PayPal ID:', error);
      throw new Error(`Failed to update order: ${error.message}`);
    }

    // Find the updated order
    const { data: order, error: findError } = await supabase
      .from('orders')
      .select('id')
      .eq('paypalOrderId', paypalOrderId)
      .single();

    if (findError) {
      console.error('Error finding updated order:', findError);
      throw new Error(`Failed to find updated order: ${findError.message}`);
    }

    const updatedOrder = await this.findById(order.id);
    if (!updatedOrder) {
      throw new Error('Order not found after PayPal update');
    }

    return updatedOrder;
  }

  async updateManyByPayPalId(paypalOrderId: string, status: string): Promise<void> {
    const supabase = this.getClient();

    const { error } = await supabase
      .from('orders')
      .update({ 
        status,
        updatedAt: new Date().toISOString()
      })
      .eq('paypalOrderId', paypalOrderId);

    if (error) {
      console.error('Error updating many orders by PayPal ID:', error);
      throw new Error(`Failed to update orders: ${error.message}`);
    }
  }

  private mapToOrderWithDetails(dbOrder: any): OrderWithDetails {
    return {
      id: dbOrder.id,
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
            productType: item.product_variants.products.product_types ? {
              id: item.product_variants.products.product_types.id,
              displayName: item.product_variants.products.product_types.displayName
            } : undefined,
            images: (item.product_variants.products.product_images || []).map((img: any) => ({
              id: img.id,
              isPrimary: img.isPrimary,
              url: img.url
            }))
          }
        }
      }))
    };
  }
}

export class DatabaseProductVariantRepository implements ProductVariantRepository {
  private getClient() {
    return createAdminClient();
  }

  async findAvailableByIds(ids: string[]): Promise<ProductVariant[]> {
    const supabase = this.getClient();

    const { data: variants, error } = await supabase
      .from('product_variants')
      .select(`
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
      `)
      .in('id', ids)
      .gt('stock', 0) // Use stock instead of status
      .eq('products.product_images.isPrimary', true);

    if (error) {
      console.error('Error fetching available variants:', error);
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
          url: img.url
        }))
      }
    }));
  }

  async findByIds(ids: string[]): Promise<ProductVariant[]> {
    const supabase = this.getClient();

    const { data: variants, error } = await supabase
      .from('product_variants')
      .select(`
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
      `)
      .in('id', ids)
      .eq('products.product_images.isPrimary', true);

    if (error) {
      console.error('Error fetching variants:', error);
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
          url: img.url
        }))
      }
    }));
  }

  async decrementStock(id: string, quantity: number): Promise<void> {
    const supabase = this.getClient();

    // Get current stock first
    const { data: variant, error: getError } = await supabase
      .from('product_variants')
      .select('stock')
      .eq('id', id)
      .single();

    if (getError) {
      console.error('Error getting variant stock:', getError);
      throw new Error(`Failed to get variant: ${getError.message}`);
    }

    const newStock = variant.stock - quantity;

    const { error } = await supabase
      .from('product_variants')
      .update({ stock: newStock })
      .eq('id', id);

    if (error) {
      console.error('Error decrementing stock:', error);
      throw new Error(`Failed to update stock: ${error.message}`);
    }
  }

  async markOutOfStockIfNeeded(id: string): Promise<void> {
    const supabase = this.getClient();

    const { data: variant, error: getError } = await supabase
      .from('product_variants')
      .select('stock')
      .eq('id', id)
      .single();

    if (getError) {
      console.error('Error getting variant for stock check:', getError);
      throw new Error(`Failed to get variant: ${getError.message}`);
    }

    if (variant && variant.stock <= 0) {
      const { error } = await supabase
        .from('product_variants')
        .update({ status: 'OUT_OF_STOCK' })
        .eq('id', id);

      if (error) {
        console.error('Error marking out of stock:', error);
        throw new Error(`Failed to mark out of stock: ${error.message}`);
      }
    }
  }
}