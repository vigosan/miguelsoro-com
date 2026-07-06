import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/lib/auth";
import { getOrderInvoice } from "@/infra/dependencies";
import { getGeneralSettings } from "@/services/databaseGeneralSettings";
import { generateInvoicePdf, formatInvoiceNumber } from "@/lib/invoice";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
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

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="factura-${formatInvoiceNumber(invoiceNumber)}.pdf"`,
    );
    return res.status(200).send(pdf);
  } catch (error) {
    console.error("Error generating invoice:", error);

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

    return res.status(500).json({ error: "No se pudo generar la factura" });
  }
};

export default requireAuth(handler);
