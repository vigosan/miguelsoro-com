import {
  OrderRepository,
  ProductVariantRepository,
  CreateOrderData,
} from "../infra/OrderRepository";

// Use cases for order management

export class FindOrderById {
  constructor(private orderRepository: OrderRepository) {}

  async execute(orderId: string) {
    if (!orderId || typeof orderId !== "string") {
      throw new Error("Order ID is required");
    }

    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  }
}

export class GetAllOrders {
  constructor(private orderRepository: OrderRepository) {}

  async execute() {
    return await this.orderRepository.findAll();
  }
}

export class FindOrderByIdForAdmin {
  constructor(private orderRepository: OrderRepository) {}

  async execute(orderId: string) {
    if (!orderId || typeof orderId !== "string") {
      throw new Error("Invalid order ID");
    }

    const order = await this.orderRepository.findByIdForAdmin(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  }
}

export class UpdateOrderStatus {
  constructor(private orderRepository: OrderRepository) {}

  async execute(orderId: string, status: string) {
    if (!status) {
      throw new Error("Status is required");
    }

    const validStatuses = [
      "PENDING",
      "PAID",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid status");
    }

    return await this.orderRepository.updateStatus(orderId, status);
  }
}

export class GetOrderInvoice {
  constructor(private orderRepository: OrderRepository) {}

  async execute(orderId: string) {
    const order = await this.orderRepository.findByIdForAdmin(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const invoiceableStatuses = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];
    if (!invoiceableStatuses.includes(order.status) && !order.invoiceNumber) {
      throw new Error("Order is not invoiceable");
    }

    if (order.invoiceNumber && order.invoicedAt) {
      return {
        order,
        invoiceNumber: order.invoiceNumber,
        invoicedAt: order.invoicedAt,
      };
    }

    const { invoiceNumber, invoicedAt } =
      await this.orderRepository.assignInvoiceNumber(orderId);

    return { order, invoiceNumber, invoicedAt };
  }
}

export class GetOrderStats {
  constructor(private orderRepository: OrderRepository) {}

  async execute() {
    return await this.orderRepository.getStats();
  }
}

export class CreateOrder {
  constructor(
    private orderRepository: OrderRepository,
    private variantRepository: ProductVariantRepository,
  ) {}

  async execute(
    orderData: Omit<CreateOrderData, "paypalOrderId" | "status" | "items"> & {
      paypalOrderId: string;
      items: Array<{ variantId: string; quantity: number }>;
    },
  ) {
    // Validate required fields
    if (
      !orderData.customerEmail ||
      !orderData.customerName ||
      !orderData.items ||
      orderData.items.length === 0
    ) {
      throw new Error("Missing required fields");
    }

    // Fetch and validate product variants
    const variantIds = orderData.items.map((item) => item.variantId);
    const variants =
      await this.variantRepository.findAvailableByIds(variantIds);

    if (variants.length !== variantIds.length) {
      throw new Error("Some products are not available");
    }

    // Calculate pricing and create order items
    const orderItems = orderData.items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant) throw new Error("Variant not found");

      return {
        variantId: variant.id,
        quantity: item.quantity,
        price: variant.price,
        total: variant.price * item.quantity,
      };
    });

    const createOrderData: CreateOrderData = {
      ...orderData,
      status: "PENDING",
      items: orderItems,
    };

    return await this.orderRepository.create(createOrderData);
  }
}

export class CapturePayPalOrder {
  constructor(
    private orderRepository: OrderRepository,
    private variantRepository: ProductVariantRepository,
  ) {}

  async execute(paypalOrderId: string) {
    if (!paypalOrderId) {
      throw new Error("PayPal Order ID is required");
    }

    // Mark the order as paid idempotently. Both this capture flow and the
    // PAYMENT.CAPTURE.COMPLETED webhook can run for the same payment, so stock
    // is only decremented when this call is the one that transitions to PAID.
    const { order, alreadyPaid } =
      await this.orderRepository.markPaidByPayPalId(paypalOrderId);

    if (!alreadyPaid) {
      for (const item of order.items) {
        await this.variantRepository.decrementStock(
          item.variantId,
          item.quantity,
        );
        await this.variantRepository.markOutOfStockIfNeeded(item.variantId);
      }
    }

    return order;
  }
}

export class HandleWebhookOrderApproved {
  constructor(private orderRepository: OrderRepository) {}

  async execute(paypalOrderId: string) {
    // Webhooks arrive out of order: a late APPROVED must never downgrade an
    // order that a capture already marked PAID (or any later status).
    await this.orderRepository.updateManyByPayPalId(
      paypalOrderId,
      "PROCESSING",
      ["PENDING"],
    );
  }
}

export class HandleWebhookPaymentCaptured {
  constructor(
    private orderRepository: OrderRepository,
    private variantRepository: ProductVariantRepository,
  ) {}

  async execute(paypalOrderId: string) {
    // Mark the order as paid idempotently. The capture-order endpoint may have
    // already processed this payment, so stock is only decremented when this
    // call is the one that transitions the order to PAID.
    const { order, alreadyPaid } =
      await this.orderRepository.markPaidByPayPalId(paypalOrderId);

    if (!alreadyPaid) {
      for (const item of order.items) {
        await this.variantRepository.decrementStock(
          item.variantId,
          item.quantity,
        );
        await this.variantRepository.markOutOfStockIfNeeded(item.variantId);
      }
    }

    return order;
  }
}

export class HandleWebhookPaymentDenied {
  constructor(private orderRepository: OrderRepository) {}

  async execute(paypalOrderId: string) {
    await this.orderRepository.updateManyByPayPalId(paypalOrderId, "CANCELLED", [
      "PENDING",
      "PROCESSING",
    ]);
  }
}

export class HandleWebhookPaymentRefunded {
  constructor(
    private orderRepository: OrderRepository,
    private variantRepository: ProductVariantRepository,
  ) {}

  async execute(paypalOrderId: string) {
    // A refund can originate from our admin (already handled) or directly from
    // the PayPal dashboard / a dispute. Only act when the order is not already
    // refunded, so stock is restored exactly once.
    const order = await this.orderRepository.findByPayPalId(paypalOrderId);
    if (!order || order.status === "REFUNDED") {
      return;
    }

    await this.orderRepository.updateManyByPayPalId(paypalOrderId, "REFUNDED");

    for (const item of order.items) {
      try {
        await this.variantRepository.incrementStock(
          item.variantId,
          item.quantity,
        );
      } catch (stockError) {
        console.error("Error restoring stock after refund webhook:", stockError);
      }
    }
  }
}
