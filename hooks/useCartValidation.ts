import { useEffect, useState, useCallback } from 'react';
import { useCart, CartItem } from '../contexts/CartContext';

interface ShippingSettings {
  standardRate: number;
  freeShippingThreshold: number;
}

export interface CartValidationIssue {
  variantId: string;
  type: 'stock_unavailable' | 'stock_reduced' | 'price_changed' | 'product_unavailable' | 'shipping_changed';
  currentValue?: number;
  cartValue?: number;
  message: string;
}

export interface CartValidationResult {
  isValid: boolean;
  issues: CartValidationIssue[];
  isLoading: boolean;
  lastChecked: Date | null;
}

export function useCartValidation() {
  const { state } = useCart();
  const [validationResult, setValidationResult] = useState<CartValidationResult>({
    isValid: true,
    issues: [],
    isLoading: false,
    lastChecked: null
  });
  const [lastShippingSettings, setLastShippingSettings] = useState<ShippingSettings | null>(null);

  const validateCart = useCallback(async () => {
    if (state.items.length === 0) {
      setValidationResult({
        isValid: true,
        issues: [],
        isLoading: false,
        lastChecked: new Date()
      });
      return;
    }

    setValidationResult(prev => ({ ...prev, isLoading: true }));

    try {
      const variantIds = state.items.map(item => item.variantId);
      
      const response = await fetch('/api/cart/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ variantIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to validate cart');
      }

      const data = await response.json();
      const issues: CartValidationIssue[] = [];

      // Check for shipping settings changes
      if (lastShippingSettings) {
        const currentShipping = data.shippingSettings;
        if (currentShipping.standardRate !== lastShippingSettings.standardRate ||
            currentShipping.freeShippingThreshold !== lastShippingSettings.freeShippingThreshold) {
          
          let message = 'Los costes de envío han cambiado. ';
          if (currentShipping.standardRate !== lastShippingSettings.standardRate) {
            message += `Coste: €${(lastShippingSettings.standardRate / 100).toFixed(2)} → €${(currentShipping.standardRate / 100).toFixed(2)}. `;
          }
          if (currentShipping.freeShippingThreshold !== lastShippingSettings.freeShippingThreshold) {
            message += `Envío gratis desde: €${(lastShippingSettings.freeShippingThreshold / 100).toFixed(2)} → €${(currentShipping.freeShippingThreshold / 100).toFixed(2)}`;
          }
          
          issues.push({
            variantId: 'shipping', // Special ID for shipping changes
            type: 'shipping_changed',
            message: message.trim()
          });
        }
      }
      
      // Store current shipping settings for next comparison
      setLastShippingSettings(data.shippingSettings);

      // Check each cart item against current database state
      state.items.forEach(cartItem => {
        const currentVariant = data.variants.find((v: any) => v.id === cartItem.variantId);
        
        if (!currentVariant) {
          issues.push({
            variantId: cartItem.variantId,
            type: 'product_unavailable',
            message: `${cartItem.title} ya no está disponible`
          });
          return;
        }

        // Check stock availability
        if (currentVariant.status !== 'AVAILABLE') {
          issues.push({
            variantId: cartItem.variantId,
            type: 'stock_unavailable',
            message: `${cartItem.title} ya no está disponible`
          });
          return;
        }

        // Check if we have enough stock
        if (currentVariant.stock < cartItem.quantity) {
          if (currentVariant.stock === 0) {
            issues.push({
              variantId: cartItem.variantId,
              type: 'stock_unavailable',
              message: `${cartItem.title} se ha agotado`
            });
          } else {
            issues.push({
              variantId: cartItem.variantId,
              type: 'stock_reduced',
              currentValue: currentVariant.stock,
              cartValue: cartItem.quantity,
              message: `${cartItem.title}: solo quedan ${currentVariant.stock} unidades (tienes ${cartItem.quantity} en el carrito)`
            });
          }
        }

        // Check price changes (convert from cents to euros for comparison)
        const currentPriceInEuros = currentVariant.price / 100;
        if (currentPriceInEuros !== cartItem.price) {
          issues.push({
            variantId: cartItem.variantId,
            type: 'price_changed',
            currentValue: currentPriceInEuros,
            cartValue: cartItem.price,
            message: `${cartItem.title}: el precio ha cambiado de €${cartItem.price.toFixed(2)} a €${currentPriceInEuros.toFixed(2)}`
          });
        }
      });

      setValidationResult({
        isValid: issues.length === 0,
        issues,
        isLoading: false,
        lastChecked: new Date()
      });

    } catch (error) {
      console.error('Error validating cart:', error);
      setValidationResult(prev => ({
        ...prev,
        isLoading: false,
        lastChecked: new Date()
      }));
    }
  }, [state.items]);

  // Auto-validate when cart changes
  useEffect(() => {
    validateCart();
  }, [validateCart]);

  // Auto-validate every 30 seconds if cart is not empty
  useEffect(() => {
    if (state.items.length === 0) return;

    const interval = setInterval(() => {
      validateCart();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [state.items.length, validateCart]);

  return {
    ...validationResult,
    validateCart
  };
}