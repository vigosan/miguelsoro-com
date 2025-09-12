import { NextApiRequest, NextApiResponse } from 'next';
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
    const webhookEvent = req.body;

    // Handle different webhook events
    switch (webhookEvent.event_type) {
      case 'CHECKOUT.ORDER.APPROVED':
        await handleOrderApproved(webhookEvent);
        break;
      
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCaptured(webhookEvent);
        break;
      
      case 'PAYMENT.CAPTURE.DENIED':
        await handlePaymentDenied(webhookEvent);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${webhookEvent.event_type}`);
    }

    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Error processing PayPal webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handleOrderApproved(event: any) {
  try {
    const orderId = event.resource.id;
    
    await prisma.order.updateMany({
      where: { paypalOrderId: orderId },
      data: { 
        status: 'PROCESSING',
        updatedAt: new Date()
      }
    });

    console.log(`Order approved: ${orderId}`);
  } catch (error) {
    console.error('Error handling order approval:', error);
  }
}

async function handlePaymentCaptured(event: any) {
  try {
    const captureId = event.resource.id;
    const orderId = event.resource.supplementary_data?.related_ids?.order_id;
    
    if (!orderId) {
      console.error('No order ID found in payment capture event');
      return;
    }

    const order = await prisma.order.update({
      where: { paypalOrderId: orderId },
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

    // Update stock for all items
    for (const item of order.items) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });

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
      console.error('Error sending webhook emails:', emailError);
    }

    console.log(`Payment captured for order: ${orderId}`);
  } catch (error) {
    console.error('Error handling payment capture:', error);
  }
}

async function handlePaymentDenied(event: any) {
  try {
    const orderId = event.resource.supplementary_data?.related_ids?.order_id;
    
    if (!orderId) {
      console.error('No order ID found in payment denied event');
      return;
    }

    await prisma.order.updateMany({
      where: { paypalOrderId: orderId },
      data: { 
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    });

    console.log(`Payment denied for order: ${orderId}`);
  } catch (error) {
    console.error('Error handling payment denial:', error);
  }
}