import { NextApiRequest, NextApiResponse } from 'next';
import { ordersController } from '../../../lib/paypal';
import { Order } from '@paypal/paypal-server-sdk';
import { capturePayPalOrder } from '../../../infra/dependencies';
import { sendOrderConfirmationEmail, sendAdminNotificationEmail } from '../../../lib/email';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paypalOrderId } = req.body;

    if (!paypalOrderId) {
      return res.status(400).json({ error: 'PayPal Order ID is required' });
    }

    // Capture the PayPal payment
    const { body: captureResponse } = await ordersController.captureOrder({
      id: paypalOrderId
    });

    const paypalOrder = captureResponse as Order;
    if (paypalOrder.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Use the capture PayPal order use case
    const order = await capturePayPalOrder.execute(paypalOrderId);

    // Send confirmation emails
    try {
      const firstItem = order.items[0];
      const emailData = {
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        pictureTitle: firstItem?.variant?.product?.title || 'Obra de arte',
        picturePrice: order.total,
        orderId: order.id,
        paypalOrderId: order.paypalOrderId || undefined
      };

      await sendOrderConfirmationEmail(emailData);
      await sendAdminNotificationEmail(emailData);
    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      // Don't fail the request if emails fail
    }

    res.status(200).json({
      success: true,
      orderId: order.id,
      status: order.status,
      captureId: paypalOrder.id
    });

  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    res.status(500).json({ error: 'Failed to capture payment' });
  }
}