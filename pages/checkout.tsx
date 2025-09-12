import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useCart } from '../contexts/CartContext';
import { calculateOrderTotal, formatPrice, formatEuros } from '../domain/order';
import { Layout } from '../components/Layout';
import Image from 'next/image';
import { getPayPalClientConfig } from '../lib/paypal';
import type { ShippingSettings } from '@/services/shippingSettings';

interface CheckoutFormData {
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { state: cartState, clearCart } = useCart();
  const [formData, setFormData] = useState<CheckoutFormData>({
    customerEmail: '',
    customerName: '',
    customerPhone: '',
    shippingAddress: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings | null>(null);

  // Fetch shipping settings on mount
  useEffect(() => {
    const fetchShippingSettings = async () => {
      try {
        const response = await fetch('/api/shipping/settings');
        if (response.ok) {
          const settings = await response.json();
          setShippingSettings(settings);
        }
      } catch (error) {
        console.error('Error fetching shipping settings:', error);
      }
    };

    fetchShippingSettings();
  }, []);

  // Calculate order totals
  const orderItems = cartState.items.map(item => ({
    id: '',
    orderId: '',
    variantId: item.variantId,
    quantity: item.quantity,
    price: Math.round(item.price * 100), // Convert euros to cents for order calculations
    total: Math.round(item.price * item.quantity * 100), // Convert euros to cents for order calculations  
    createdAt: new Date()
  }));

  const { subtotal, tax, shipping, total } = calculateOrderTotal(
    orderItems,
    shippingSettings?.standardRate,
    shippingSettings?.freeShippingThreshold
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isFormValid = () => {
    return formData.customerEmail && formData.customerName && cartState.items.length > 0;
  };

  const createOrder = async () => {
    if (!isFormValid()) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          items: cartState.items.map(item => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      return data.paypalOrderId;
    } catch (error) {
      console.error('Error creating order:', error);
      setError('Error al crear la orden. Por favor intenta nuevamente.');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const onApprove = async (data: any) => {
    try {
      setIsProcessing(true);
      
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paypalOrderId: data.orderID,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to capture payment');
      }

      const result = await response.json();
      
      // Clear cart and redirect to success page
      clearCart();
      router.push(`/order-confirmation?orderId=${result.orderId}`);
      
    } catch (error) {
      console.error('Error capturing payment:', error);
      setError('Error al procesar el pago. Por favor contacta con soporte.');
      setIsProcessing(false);
    }
  };

  const onError = (err: any) => {
    console.error('PayPal error:', err);
    setError('Error con PayPal. Por favor intenta nuevamente.');
    setIsProcessing(false);
  };

  if (cartState.items.length === 0) {
    return (
      <Layout title="Checkout - Miguel Soro">
        <div className="max-w-2xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h1>
          <p className="text-gray-600 mb-8">Añade algunos productos a tu carrito para continuar con el checkout.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
          >
            Continuar comprando
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Checkout - Miguel Soro">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8" data-testid="checkout-title">
          Finalizar compra
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Information Form */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Información de contacto</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="customerEmail"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    data-testid="customer-email"
                  />
                </div>

                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    data-testid="customer-name"
                  />
                </div>

                <div>
                  <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="customerPhone"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    data-testid="customer-phone"
                  />
                </div>

                <div>
                  <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección de envío
                  </label>
                  <textarea
                    id="shippingAddress"
                    name="shippingAddress"
                    rows={3}
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    data-testid="shipping-address"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Resumen del pedido</h2>
              
              <div className="space-y-4 mb-6">
                {cartState.items.map((item) => (
                  <div key={item.variantId} className="flex items-center space-x-3" data-testid={`checkout-item-${item.variantId}`}>
                    {item.imageUrl && (
                      <div className="w-16 h-16 rounded-md overflow-hidden border">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatEuros(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span data-testid="checkout-subtotal">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IVA (21%):</span>
                  <span data-testid="checkout-tax">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Envío:</span>
                  <span data-testid="checkout-shipping">{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span data-testid="checkout-total">{formatPrice(total)}</span>
                </div>
              </div>

              {shipping === 0 && (
                <p className="text-sm text-green-600 mt-2">¡Envío gratuito!</p>
              )}
            </div>

            {/* PayPal Payment */}
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Pago</h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4" data-testid="checkout-error">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {isFormValid() ? (
                <PayPalScriptProvider options={getPayPalClientConfig()}>
                  <PayPalButtons
                    disabled={isProcessing}
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={onError}
                    style={{
                      layout: 'vertical',
                      color: 'blue',
                      shape: 'rect',
                      label: 'paypal'
                    }}
                  />
                </PayPalScriptProvider>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Completa la información requerida para continuar con el pago.
                </div>
              )}

              {isProcessing && (
                <div className="text-center py-4" data-testid="processing-indicator">
                  <div className="inline-flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    <span className="ml-2">Procesando...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}