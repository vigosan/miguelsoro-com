import { NextApiRequest, NextApiResponse } from "next";
import {
  handleWebhookOrderApproved,
  handleWebhookPaymentCaptured,
  handleWebhookPaymentDenied,
} from "../../../infra/dependencies";
import {
  sendOrderConfirmationEmail,
  sendAdminNotificationEmail,
} from "../../../lib/email";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const webhookEvent = req.body;

    // Handle different webhook events
    switch (webhookEvent.event_type) {
      case "CHECKOUT.ORDER.APPROVED":
        await handleWebhookOrderApproved.execute(webhookEvent);
        break;

      case "PAYMENT.CAPTURE.COMPLETED":
        await handleWebhookPaymentCaptured.execute(webhookEvent);
        break;

      case "PAYMENT.CAPTURE.DENIED":
        await handleWebhookPaymentDenied.execute(webhookEvent);
        break;

      default:
        console.log(`Unhandled webhook event: ${webhookEvent.event_type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error processing PayPal webhook:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}
