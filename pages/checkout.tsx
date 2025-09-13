import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useCart } from '../contexts/CartContext';
import { calculateOrderTotal, formatPrice, formatEuros } from '../domain/order';
import { Layout } from '../components/Layout';
import { Input } from '../components/ui/Input';
import Image from 'next/image';
import { getPayPalClientConfig } from '../lib/paypal';
import type { ShippingSettings } from '@/services/databaseShippingSettings';

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
        const errorData = await response.json().catch(() => ({}));
        console.error('PayPal create order failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Failed to create order: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('PayPal order created successfully:', data.paypalOrderId);
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
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="checkout-title">
            Finalizar compra
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Completa tu pedido y disfruta de arte ciclístico único
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Customer Information Form */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Información de contacto</h2>
              
              <div className="space-y-5">
                <Input
                  type="email"
                  name="customerEmail"
                  label="Email *"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  required
                  placeholder="tu@email.com"
                  data-testid="customer-email"
                />

                <Input
                  type="text"
                  name="customerName"
                  label="Nombre completo *"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  placeholder="Tu nombre completo"
                  data-testid="customer-name"
                />

                <Input
                  type="tel"
                  name="customerPhone"
                  label="Teléfono"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  placeholder="+34 600 000 000"
                  data-testid="customer-phone"
                />

                <div>
                  <label htmlFor="shippingAddress" className="block text-sm/6 font-medium text-gray-900 mb-2">
                    Dirección de envío
                  </label>
                  <textarea
                    id="shippingAddress"
                    name="shippingAddress"
                    rows={4}
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6 resize-none"
                    placeholder="Calle, número, código postal, ciudad, país"
                    data-testid="shipping-address"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Resumen del pedido</h2>
              
              <div className="space-y-6 mb-10">
                {cartState.items.map((item) => (
                  <div key={item.variantId} className="flex items-start space-x-4 pb-6 border-b border-gray-100 last:border-b-0 last:pb-0" data-testid={`checkout-item-${item.variantId}`}>
                    {item.imageUrl && (
                      <div className="w-20 h-20 overflow-hidden flex-shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg leading-tight">{item.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">Cantidad: {item.quantity}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-lg text-gray-900">{formatEuros(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-8 border-t border-gray-200">
                <div className="flex justify-between text-base text-gray-600">
                  <span>Subtotal:</span>
                  <span data-testid="checkout-subtotal">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-base text-gray-600">
                  <span>IVA (21%):</span>
                  <span data-testid="checkout-tax">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-base text-gray-600">
                  <span>Envío:</span>
                  <span data-testid="checkout-shipping">{formatPrice(shipping)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total:</span>
                    <span data-testid="checkout-total">{formatPrice(total)}</span>
                  </div>
                </div>
                
                {shipping === 0 && (
                  <div className="pt-4">
                    <p className="text-sm text-green-600 font-medium">¡Envío gratuito!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PayPal Payment - Moved to bottom for better visibility */}
        <div className="pt-12 border-t border-gray-200 mt-12">
          <div className="max-w-lg mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Finalizar pago</h2>
            <p className="text-gray-600 mb-8">Completa tu compra de forma segura con PayPal</p>
            
            {error && (
              <div className="border border-red-200 p-4 mb-8 text-left" data-testid="checkout-error">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            {isFormValid() ? (
              <div>
                <PayPalScriptProvider options={getPayPalClientConfig()}>
                  <PayPalButtons
                    disabled={isProcessing}
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={onError}
                    style={{
                      layout: 'vertical',
                      color: 'black',
                      shape: 'rect',
                      label: 'paypal',
                      height: 55
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">
                  Completa la información requerida para continuar con el pago
                </p>
              </div>
            )}

            {isProcessing && (
              <div className="border border-gray-200 p-6 text-center mt-8" data-testid="processing-indicator">
                <div className="inline-flex items-center text-gray-900">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                  <span className="ml-3 font-medium">Procesando tu pago...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}