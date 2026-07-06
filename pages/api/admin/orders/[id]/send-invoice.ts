import type { NextApiRequest, NextApiResponse } from "next";
import { orderReference } from "@/domain/order";
import { requireAuth } from "@/lib/auth";
import { getOrderInvoice } from "@/infra/dependencies";
import { getGeneralSettings } from "@/services/databaseGeneralSettings";
import { generateInvoicePdf, formatInvoiceNumber } from "@/lib/invoice";
import { sendInvoiceEmail } from "@/lib/email";

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
    const settings = await getGeneralSettings();
    if (
      !settings?.businessName ||
      !settings?.businessNif ||
      !settings?.businessAddress
    ) {
      return res.status(409).json({
        error:
          "Faltan los datos fiscales. Complétalos en Ajustes → General antes de emitir facturas.",
      });
    }

    const { order, invoiceNumber, invoicedAt } =
      await getOrderInvoice.execute(id);

    const pdf = await generateInvoicePdf({
      order,
      seller: {
        name: settings.businessName,
        nif: settings.businessNif,
        address: settings.businessAddress,
      },
      invoiceNumber,
      invoicedAt,
    });

    const formattedNumber = formatInvoiceNumber(invoiceNumber);

    try {
      await sendInvoiceEmail(
        {
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          pictureTitle:
            order.items[0]?.variant?.product?.title || "Obra de arte",
          picturePrice: order.total,
          orderId: orderReference(order),
          paypalOrderId: order.paypalOrderId || undefined,
        },
        formattedNumber,
        pdf,
      );
    } catch (emailError) {
      console.error("Error sending invoice email:", emailError);
      return res.status(502).json({
        error: "No se pudo enviar el email con la factura. Inténtalo de nuevo.",
      });
    }

    return res.status(200).json({
      success: true,
      invoiceNumber: formattedNumber,
      sentTo: order.customerEmail,
    });
  } catch (error) {
    console.error("Error sending invoice:", error);

    if (error instanceof Error) {
      if (error.message === "Order not found") {
        return res.status(404).json({ error: "Pedido no encontrado" });
      }
      if (error.message === "Order is not invoiceable") {
        return res.status(400).json({
          error: "Solo se pueden facturar pedidos pagados",
        });
      }
    }

    return res.status(500).json({ error: "No se pudo enviar la factura" });
  }
};

export default requireAuth(handler);
