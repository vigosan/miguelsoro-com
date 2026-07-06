import type { NextApiRequest, NextApiResponse } from "next";
import { orderReference } from "@/domain/order";
import { requireAuth } from "@/lib/auth";
import { paymentsController } from "@/lib/paypal";
import {
  orderRepository,
  productVariantRepository,
} from "@/infra/dependencies";
import { sendOrderStatusEmail } from "@/lib/email";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid order ID" });
  }

  try {
    const order = await orderRepository.findByIdForAdmin(id);
    if (!order) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    // Idempotency: never refund the same order twice.
    if (order.status === "REFUNDED") {
      return res.status(409).json({ error: "El pedido ya está reembolsado" });
    }

    // Only paid orders can be refunded, and only if we have the capture id.
    if (order.status !== "PAID") {
      return res
        .status(400)
        .json({ error: "Solo se pueden reembolsar pedidos pagados" });
    }
    if (!order.captureId) {
      return res.status(400).json({
        error:
          "Este pedido no tiene ID de captura de PayPal. Reembólsalo manualmente desde PayPal.",
      });
    }

    // Full refund: empty body tells PayPal to refund the whole capture.
    const { body } = await paymentsController.refundCapturedPayment({
      captureId: order.captureId,
    });

    const refund = typeof body === "string" ? JSON.parse(body) : body;

    if (refund?.status !== "COMPLETED" && refund?.status !== "PENDING") {
      console.error("PayPal refund not completed:", refund);
      return res.status(502).json({
        error: "PayPal no confirmó el reembolso",
        status: refund?.status,
      });
    }

    // Only after PayPal confirms: mark refunded and restore stock.
    await orderRepository.updateStatus(id, "REFUNDED");

    for (const item of order.items) {
      try {
        await productVariantRepository.incrementStock(
          item.variantId,
          item.quantity,
        );
      } catch (stockError) {
        // Stock restore is best-effort; the money is already refunded.
        console.error("Error restoring stock after refund:", stockError);
      }
    }

    try {
      await sendOrderStatusEmail(
        {
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          pictureTitle:
            order.items[0]?.variant?.product?.title || "Obra de arte",
          picturePrice: order.total,
          orderId: orderReference(order),
          paypalOrderId: order.paypalOrderId || undefined,
        },
        "REFUNDED",
      );
    } catch (emailError) {
      // Notification is best-effort; the money is already refunded.
      console.error("Error sending refund email:", emailError);
    }

    return res.status(200).json({
      success: true,
      orderId: id,
      refundId: refund?.id,
      status: "REFUNDED",
    });
  } catch (error) {
    console.error("Error refunding order:", error);
    return res.status(500).json({ error: "No se pudo procesar el reembolso" });
  }
};

export default requireAuth(handler);
