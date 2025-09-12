import { NextApiRequest, NextApiResponse } from 'next';
import { paypalClient } from '../../../lib/paypal';
import { prisma } from '../../../lib/prisma';
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
    const { body: captureResponse } = await paypalClient.orders.ordersCapture({
      id: paypalOrderId
    });

    if (captureResponse.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Update order status in database
    const order = await prisma.order.update({
      where: { paypalOrderId },
      data: { 
        status: 'PAID',
        updatedAt: new Date()
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: {
                      where: { isPrimary: true },
                      take: 1
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Update variant stock for each item
    for (const item of order.items) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });

      // Mark as out of stock if needed
      const updatedVariant = await prisma.productVariant.findUnique({
        where: { id: item.variantId }
      });

      if (updatedVariant && updatedVariant.stock <= 0) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { status: 'OUT_OF_STOCK' }
        });
      }
    }

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
      status: 'PAID',
      captureId: captureResponse.id
    });

  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    res.status(500).json({ error: 'Failed to capture payment' });
  }
}