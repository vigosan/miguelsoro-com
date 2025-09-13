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
    console.log('PayPal create-order: Request received:', { 
      customerEmail: req.body.customerEmail ? 'provided' : 'missing',
      customerName: req.body.customerName ? 'provided' : 'missing',
      itemsCount: req.body.items?.length || 0
    });

    const { customerEmail, customerName, customerPhone, shippingAddress, items }: CreateOrderRequest = req.body;

    if (!customerEmail || !customerName || !items || items.length === 0) {
      console.log('PayPal create-order: Missing required fields validation failed');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch product variants to calculate pricing
    const variantIds = items.map(item => item.variantId);
    console.log('PayPal create-order: Fetching variants for IDs:', variantIds);
    
    const variants = await productVariantRepository.findAvailableByIds(variantIds);
    console.log('PayPal create-order: Found variants:', variants.length, 'out of', variantIds.length);

    if (variants.length !== variantIds.length) {
      console.log('PayPal create-order: Some variants not found. Expected:', variantIds.length, 'Found:', variants.length);
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

    console.log('PayPal create-order: Order totals calculated:', {
      subtotal,
      tax,
      shipping,
      total,
      subtotalEur: (subtotal / 100).toFixed(2),
      taxEur: (tax / 100).toFixed(2),
      shippingEur: (shipping / 100).toFixed(2),
      totalEur: (total / 100).toFixed(2)
    });

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

    console.log('PayPal create-order: Sending request to PayPal API...');
    
    const { body: paypalOrderResponse } = await ordersController.createOrder({
      body: paypalOrderRequest
    });

    console.log('PayPal create-order: PayPal API response received:', {
      id: paypalOrderResponse?.id,
      status: paypalOrderResponse?.status
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
    console.error('PayPal create-order: Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    });
    res.status(500).json({ error: 'Failed to create order' });
  }
}