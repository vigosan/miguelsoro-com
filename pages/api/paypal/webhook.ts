import { NextApiRequest, NextApiResponse } from "next";
import {
  handleWebhookOrderApproved,
  handleWebhookPaymentCaptured,
  handleWebhookPaymentDenied,
  handleWebhookPaymentRefunded,
} from "../../../infra/dependencies";
import { verifyWebhookSignature } from "../../../lib/paypalWebhook";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const isVerified = await verifyWebhookSignature(req);
    if (!isVerified) {
      console.error("PayPal webhook signature verification failed");
      return res.status(401).json({ error: "Invalid webhook signature" });
    }

    const webhookEvent = req.body;

    // Handle different webhook events. Each use case expects the PayPal order
    // ID (the value stored as paypalOrderId). For order events it is the
    // resource id; for capture events it lives in supplementary_data.
    switch (webhookEvent.event_type) {
      case "CHECKOUT.ORDER.APPROVED": {
        const orderId = webhookEvent.resource?.id;
        if (orderId) {
          await handleWebhookOrderApproved.execute(orderId);
        }
        break;
      }

      case "PAYMENT.CAPTURE.COMPLETED": {
        const orderId =
          webhookEvent.resource?.supplementary_data?.related_ids?.order_id;
        if (orderId) {
          await handleWebhookPaymentCaptured.execute(orderId);
        }
        break;
      }

      case "PAYMENT.CAPTURE.DENIED": {
        const orderId =
          webhookEvent.resource?.supplementary_data?.related_ids?.order_id;
        if (orderId) {
          await handleWebhookPaymentDenied.execute(orderId);
        }
        break;
      }

      case "PAYMENT.CAPTURE.REFUNDED": {
        const orderId =
          webhookEvent.resource?.supplementary_data?.related_ids?.order_id;
        if (orderId) {
          await handleWebhookPaymentRefunded.execute(orderId);
        }
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${webhookEvent.event_type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error processing PayPal webhook:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}
