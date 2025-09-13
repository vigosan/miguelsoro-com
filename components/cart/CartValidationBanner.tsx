import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useCartValidation, CartValidationIssue } from '../../hooks/useCartValidation';
import { useCart } from '../../contexts/CartContext';
import { useState } from 'react';

export default function CartValidationBanner() {
  const { isValid, issues, isLoading } = useCartValidation();
  const { removeItem, updateQuantity } = useCart();
  const [dismissedIssues, setDismissedIssues] = useState<string[]>([]);

  if (isValid || isLoading || issues.length === 0) {
    return null;
  }

  const visibleIssues = issues.filter(issue => 
    !dismissedIssues.includes(issue.variantId)
  );

  if (visibleIssues.length === 0) {
    return null;
  }

  const handleFixIssue = (issue: CartValidationIssue) => {
    switch (issue.type) {
      case 'stock_unavailable':
      case 'product_unavailable':
        removeItem(issue.variantId);
        break;
      case 'stock_reduced':
        if (issue.currentValue !== undefined) {
          updateQuantity(issue.variantId, issue.currentValue);
        }
        break;
      case 'price_changed':
        // For price changes, we just dismiss the warning
        // The price will be updated at checkout
        setDismissedIssues(prev => [...prev, issue.variantId]);
        break;
    }
  };

  const handleDismiss = (variantId: string) => {
    setDismissedIssues(prev => [...prev, variantId]);
  };

  return (
    <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Hay cambios en tu carrito
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <ul className="space-y-2">
              {visibleIssues.map((issue) => (
                <li key={issue.variantId} className="flex items-start justify-between">
                  <span>{issue.message}</span>
                  <div className="ml-4 flex space-x-2">
                    {(issue.type === 'stock_unavailable' || 
                      issue.type === 'product_unavailable' || 
                      issue.type === 'stock_reduced') && (
                      <button
                        onClick={() => handleFixIssue(issue)}
                        className="text-yellow-800 hover:text-yellow-900 font-medium underline"
                      >
                        {issue.type === 'stock_reduced' ? 'Ajustar' : 'Eliminar'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDismiss(issue.variantId)}
                      className="text-yellow-600 hover:text-yellow-700"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}