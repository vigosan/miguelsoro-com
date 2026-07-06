import type { NextApiRequest, NextApiResponse } from "next";
import { orderReference } from "@/domain/order";
import {
  findOrderByIdForAdmin,
  updateOrderStatus,
  getOrderInvoice,
} from "../../../../infra/dependencies";
import { requireAuth } from "@/lib/auth";
import { sendOrderStatusEmail, InvoiceAttachment } from "@/lib/email";
import { getGeneralSettings } from "@/services/databaseGeneralSettings";
import { generateInvoicePdf, formatInvoiceNumber } from "@/lib/invoice";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const order = await findOrderByIdForAdmin.execute(id as string);

      // Transform order to match expected format
      const transformedOrder = {
        id: order.id,
        orderNumber: order.orderNumber,
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
      const previousOrder = await findOrderByIdForAdmin.execute(id as string);
      const updatedOrder = await updateOrderStatus.execute(
        id as string,
        status,
      );

      let warning: string | undefined;

      // A cancelled PENDING order never had a payment, so there is no
      // customer expectation to manage: skip the notification.
      const shouldNotify =
        status === "PROCESSING" ||
        status === "SHIPPED" ||
        (status === "CANCELLED" && previousOrder.status !== "PENDING");

      if (shouldNotify) {
        let invoice: InvoiceAttachment | undefined;

        if (status === "SHIPPED") {
          try {
            const settings = await getGeneralSettings();
            if (
              !settings?.businessName ||
              !settings?.businessNif ||
              !settings?.businessAddress
            ) {
              warning =
                "Pedido actualizado, pero el email salió sin factura: faltan los datos fiscales en Ajustes → General.";
            } else {
              const invoiceData = await getOrderInvoice.execute(id as string);
              const pdf = await generateInvoicePdf({
                order: invoiceData.order,
                seller: {
                  name: settings.businessName,
                  nif: settings.businessNif,
                  address: settings.businessAddress,
                },
                invoiceNumber: invoiceData.invoiceNumber,
                invoicedAt: invoiceData.invoicedAt,
              });
              invoice = {
                formattedNumber: formatInvoiceNumber(invoiceData.invoiceNumber),
                pdf,
              };
            }
          } catch (invoiceError) {
            console.error("Error generating invoice for email:", invoiceError);
            warning =
              "Pedido actualizado, pero el email salió sin factura: no se pudo generar. Envíala manualmente.";
          }
        }

        try {
          const firstItem = updatedOrder.items[0];
          await sendOrderStatusEmail(
            {
              customerName: updatedOrder.customerName,
              customerEmail: updatedOrder.customerEmail,
              pictureTitle:
                firstItem?.variant?.product?.title || "Obra de arte",
              picturePrice: updatedOrder.total,
              orderId: orderReference(updatedOrder),
              paypalOrderId: updatedOrder.paypalOrderId || undefined,
            },
            status,
            invoice,
          );
        } catch (emailError) {
          console.error("Error sending status email:", emailError);
        }
      }

      return res
        .status(200)
        .json({ order: updatedOrder, ...(warning ? { warning } : {}) });
    } catch (error) {
      console.error("Error updating order:", error);

      if (error instanceof Error) {
        if (error.message === "Status is required") {
          return res.status(400).json({ error: "Status is required" });
        }
        if (error.message === "Invalid status") {
          return res.status(400).json({ error: "Invalid status" });
        }
        if (error.message === "Order not found") {
          return res.status(404).json({ error: "Order not found" });
        }
      }

      return res.status(500).json({ error: "Failed to update order" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};

export default requireAuth(handler);
