import { NextApiRequest, NextApiResponse } from 'next';
import { ordersController } from '../../../lib/paypal';
import { Order, OrderRequest, CheckoutPaymentIntent } from '@paypal/paypal-server-sdk';
import { productVariantRepository, createOrder } from '../../../infra/dependencies';
import { CreateOrderRequest, calculateOrderTotal } from '../../../domain/order';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerEmail, customerName, customerPhone, shippingAddress, items }: CreateOrderRequest = req.body;

    if (!customerEmail || !customerName || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch product variants to calculate pricing
    const variantIds = items.map(item => item.variantId);
    const variants = await productVariantRepository.findAvailableByIds(variantIds);

    if (variants.length !== variantIds.length) {
      return res.status(400).json({ error: 'Some products are not available' });
    }

    // Calculate order totals
    const orderItems = items.map(item => {
      const variant = variants.find(v => v.id === item.variantId);
      if (!variant) throw new Error('Variant not found');

      return {
        variantId: variant.id,
        quantity: item.quantity,
        price: variant.price,
        total: variant.price * item.quantity,
        variant
      };
    });

    const { subtotal, tax, shipping, total } = calculateOrderTotal(
      orderItems.map(item => ({
        id: '',
        orderId: '',
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        createdAt: new Date()
      }))
    );

    // Create PayPal order
    const paypalOrderRequest: OrderRequest = {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          amount: {
            currencyCode: 'EUR',
            value: (total / 100).toFixed(2),
            breakdown: {
              itemTotal: {
                currencyCode: 'EUR',
                value: (subtotal / 100).toFixed(2)
              },
              taxTotal: {
                currencyCode: 'EUR',
                value: (tax / 100).toFixed(2)
              },
              shipping: {
                currencyCode: 'EUR',
                value: (shipping / 100).toFixed(2)
              }
            }
          },
          items: orderItems.map(item => ({
            name: item.variant.product.title,
            quantity: item.quantity.toString(),
            unitAmount: {
              currencyCode: 'EUR',
              value: (item.price / 100).toFixed(2)
            }
          }))
        }
      ]
    };

    const { body: paypalOrderResponse } = await ordersController.createOrder({
      body: paypalOrderRequest
    });

    const paypalOrder = paypalOrderResponse as Order;

    // Create order in database
    const order = await createOrder.execute({
      customerEmail,
      customerName,
      customerPhone,
      shippingAddress,
      paypalOrderId: paypalOrder.id!,
      subtotal,
      tax,
      shipping,
      total,
      items: items.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity
      }))
    });

    res.status(200).json({
      paypalOrderId: paypalOrder.id,
      orderId: order.id,
      total: order.total,
      approvalUrl: paypalOrder.links?.find(link => link.rel === 'approve')?.href
    });

  } catch (error) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
}