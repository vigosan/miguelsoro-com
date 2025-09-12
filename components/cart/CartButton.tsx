import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../contexts/CartContext';

export default function CartButton() {
  const { state, toggleCart } = useCart();

  return (
    <button
      onClick={toggleCart}
      className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors"
      data-testid="cart-button"
    >
      <ShoppingBagIcon className="h-6 w-6" />
      {state.itemCount > 0 && (
        <span 
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
          data-testid="cart-count"
        >
          {state.itemCount}
        </span>
      )}
    </button>
  );
}