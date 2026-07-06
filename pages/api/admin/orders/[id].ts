import type { NextApiRequest, NextApiResponse } from "next";
import {
  findOrderByIdForAdmin,
  updateOrderStatus,
} from "../../../../infra/dependencies";
import { requireAuth } from "@/lib/auth";
import { sendOrderStatusEmail } from "@/lib/email";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const order = await findOrderByIdForAdmin.execute(id as string);

      // Transform order to match expected format
      const transformedOrder = {
        id: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        shippingAddress: order.shippingAddress,
        status: order.status,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        total: order.total,
        paypalOrderId: order.paypalOrderId,
        invoiceNumber: order.invoiceNumber,
        invoicedAt: order.invoicedAt?.toISOString(),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        items: order.items.map((item) => ({
          id: item.id,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          variant: {
            id: item.variant.id,
            price: item.variant.price,
            status: item.variant.status,
            product: {
              id: item.variant.product.id,
              title: item.variant.product.title,
              slug: item.variant.product.slug,
              productType: item.variant.product.productType
                ? {
                    id: item.variant.product.productType.id,
                    displayName: item.variant.product.productType.displayName,
                  }
                : undefined,
              images: item.variant.product.images || [],
            },
          },
        })),
      };

      return res.status(200).json({ order: transformedOrder });
    } catch (error) {
      console.error("Error fetching order:", error);

      if (error instanceof Error) {
        if (error.message === "Invalid order ID") {
          return res.status(400).json({ error: "Invalid order ID" });
        }
        if (error.message === "Order not found") {
          return res.status(404).json({ error: "Order not found" });
        }
      }

      return res.status(500).json({ error: "Failed to fetch order" });
    }
  }

  if (req.method === "PUT") {
    try {
      const { status } = req.body;
      const updatedOrder = await updateOrderStatus.execute(
        id as string,
        status,
      );

      if (status === "PROCESSING" || status === "SHIPPED") {
        try {
          const firstItem = updatedOrder.items[0];
          await sendOrderStatusEmail(
            {
              customerName: updatedOrder.customerName,
              customerEmail: updatedOrder.customerEmail,
              pictureTitle: firstItem?.variant?.product?.title || "Obra de arte",
              picturePrice: updatedOrder.total,
              orderId: updatedOrder.id,
              paypalOrderId: updatedOrder.paypalOrderId || undefined,
            },
            status,
          );
        } catch (emailError) {
          console.error("Error sending status email:", emailError);
        }
      }

      return res.status(200).json({ order: updatedOrder });
    } catch (error) {
      console.error("Error updating order:", error);

      if (error instanceof Error) {
        if (error.message === "Status is required") {
          return res.status(400).json({ error: "Status is required" });
        }
        if (error.message === "Invalid status") {
          return res.status(400).json({ error: "Invalid status" });
        }
      }

      return res.status(500).json({ error: "Failed to update order" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};

export default requireAuth(handler);
