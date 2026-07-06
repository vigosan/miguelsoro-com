import { NextApiRequest, NextApiResponse } from "next";
import { ordersController } from "../../../lib/paypal";
import { Order } from "@paypal/paypal-server-sdk";
import {
  capturePayPalOrder,
  orderRepository,
} from "../../../infra/dependencies";
import {
  sendOrderConfirmationEmail,
  sendAdminNotificationEmail,
} from "../../../lib/email";
import { getGeneralSettings } from "../../../services/databaseGeneralSettings";
import { orderReference } from "../../../domain/order";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("PayPal capture-order: Request received:", {
      paypalOrderId: req.body.paypalOrderId ? "provided" : "missing",
    });

    const { paypalOrderId } = req.body;

    if (!paypalOrderId) {
      console.log("PayPal capture-order: Missing PayPal Order ID");
      return res.status(400).json({ error: "PayPal Order ID is required" });
    }

    console.log("PayPal capture-order: Capturing PayPal order:", paypalOrderId);

    // Capture the PayPal payment
    const { body: captureResponse } = await ordersController.captureOrder({
      id: paypalOrderId,
    });

    console.log(
      "PayPal capture-order: Raw capture response:",
      JSON.stringify(captureResponse, null, 2),
    );

    // Parse the response if it's a string (like in create-order)
    let paypalOrder: Order;
    if (typeof captureResponse === "string") {
      paypalOrder = JSON.parse(captureResponse) as Order;
      console.log("PayPal capture-order: Parsed JSON string response");
    } else {
      paypalOrder = captureResponse as Order;
    }

    console.log(
      "PayPal capture-order: Parsed order status:",
      paypalOrder?.status,
    );

    if (paypalOrder.status !== "COMPLETED") {
      console.log(
        "PayPal capture-order: Payment not completed, status:",
        paypalOrder.status,
      );
      return res
        .status(400)
        .json({ error: "Payment not completed", status: paypalOrder.status });
    }

    // Use the capture PayPal order use case
    const order = await capturePayPalOrder.execute(paypalOrderId);

    // Persist the real capture id (needed to refund later). It lives inside the
    // purchase unit's payments, not at the order level. Best-effort: a failure
    // here must not break a successful payment.
    try {
      const captureId =
        paypalOrder.purchaseUnits?.[0]?.payments?.captures?.[0]?.id;
      if (captureId) {
        await orderRepository.setCaptureId(paypalOrderId, captureId);
      }
    } catch (captureIdError) {
      console.error("Error persisting capture id:", captureIdError);
    }

    // Send confirmation emails
    try {
      const firstItem = order.items[0];
      const emailData = {
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        pictureTitle: firstItem?.variant?.product?.title || "Obra de arte",
        picturePrice: order.total,
        orderId: orderReference(order),
        paypalOrderId: order.paypalOrderId || undefined,
      };

      const generalSettings = await getGeneralSettings();
      const adminEmail = generalSettings?.contactEmail;

      await sendOrderConfirmationEmail(emailData);
      await sendAdminNotificationEmail(emailData, adminEmail);
    } catch (emailError) {
      console.error("Error sending emails:", emailError);
      // Don't fail the request if emails fail
    }

    res.status(200).json({
      success: true,
      orderId: order.id,
      status: order.status,
      captureId: paypalOrder.id,
    });
  } catch (error) {
    console.error("PayPal capture-order: Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      error: error,
    });
    res.status(500).json({ error: "Failed to capture payment" });
  }
}
