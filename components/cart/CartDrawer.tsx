import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../contexts/CartContext';
import { formatEuros } from '../../domain/order';
import Image from 'next/image';
import Link from 'next/link';

export default function CartDrawer() {
  const { state, removeItem, updateQuantity, setCartOpen, getFormattedTotal } = useCart();

  return (
    <Transition.Root show={state.isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setCartOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            {/* Mobile: Bottom sheet */}
            <div className="pointer-events-none fixed inset-x-0 bottom-0 flex max-h-full pt-10 md:hidden">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-y-full"
                enterTo="translate-y-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-y-0"
                leaveTo="translate-y-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen">
                  <div className="flex h-full max-h-[85vh] flex-col overflow-y-scroll bg-white shadow-xl rounded-t-xl">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          Carrito de compras
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={() => setCartOpen(false)}
                            data-testid="cart-close-button"
                          >
                            <span className="sr-only">Cerrar carrito</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="flow-root">
                          <ul role="list" className="-my-6 divide-y divide-gray-200" data-testid="cart-items">
                            {state.items.length === 0 ? (
                              <li className="py-6 text-center text-gray-500">
                                Tu carrito está vacío
                              </li>
                            ) : (
                              state.items.map((item) => (
                                <li key={item.variantId} className="flex py-6" data-testid={`cart-item-${item.variantId}`}>
                                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                    {item.imageUrl && (
                                      <Image
                                        src={item.imageUrl}
                                        alt={item.title}
                                        width={96}
                                        height={96}
                                        className="h-full w-full object-cover object-center"
                                      />
                                    )}
                                  </div>

                                  <div className="ml-4 flex flex-1 flex-col">
                                    <div>
                                      <div className="flex justify-between text-base font-medium text-gray-900">
                                        <h3>
                                          <Link 
                                            href={`/pictures/${item.slug}`}
                                            onClick={() => setCartOpen(false)}
                                            className="hover:text-gray-600"
                                          >
                                            {item.title}
                                          </Link>
                                        </h3>
                                        <p className="ml-4">{formatEuros(item.price)}</p>
                                      </div>
                                    </div>
                                    <div className="flex flex-1 items-end justify-between text-sm">
                                      <div className="flex items-center space-x-2">
                                        <button
                                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                          className="p-1 text-gray-400 hover:text-gray-600"
                                          data-testid={`decrease-quantity-${item.variantId}`}
                                        >
                                          <MinusIcon className="h-4 w-4" />
                                        </button>
                                        <span 
                                          className="text-gray-700 px-2 py-1 border rounded"
                                          data-testid={`quantity-${item.variantId}`}
                                        >
                                          {item.quantity}
                                        </span>
                                        <button
                                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                          disabled={item.stock ? item.quantity >= item.stock : false}
                                          className={`p-1 ${item.stock && item.quantity >= item.stock ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'}`}
                                          data-testid={`increase-quantity-${item.variantId}`}
                                        >
                                          <PlusIcon className="h-4 w-4" />
                                        </button>
                                      </div>

                                      <div className="flex">
                                        <button
                                          type="button"
                                          onClick={() => removeItem(item.variantId)}
                                          className="font-medium text-red-600 hover:text-red-500"
                                          data-testid={`remove-item-${item.variantId}`}
                                        >
                                          <TrashIcon className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              ))
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {state.items.length > 0 && (
                      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <p>Subtotal</p>
                          <p data-testid="cart-total">{getFormattedTotal()}</p>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500">
                          Envío e impuestos calculados al finalizar la compra.
                        </p>
                        <div className="mt-6">
                          <Link
                            href="/checkout"
                            onClick={() => setCartOpen(false)}
                            className="flex items-center justify-center rounded-md border border-transparent bg-gray-900 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-gray-800 transition-colors"
                            data-testid="checkout-button"
                          >
                            Finalizar compra
                          </Link>
                        </div>
                        <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                          <p>
                            o{' '}
                            <button
                              type="button"
                              className="font-medium text-gray-900 hover:text-gray-600"
                              onClick={() => setCartOpen(false)}
                            >
                              Continuar comprando
                              <span aria-hidden="true"> &rarr;</span>
                            </button>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
            
            {/* Desktop: Right slide */}
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 hidden md:flex">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          Carrito de compras
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={() => setCartOpen(false)}
                            data-testid="cart-close-button"
                          >
                            <span className="sr-only">Cerrar carrito</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="flow-root">
                          <ul role="list" className="-my-6 divide-y divide-gray-200" data-testid="cart-items">
                            {state.items.length === 0 ? (
                              <li className="py-6 text-center text-gray-500">
                                Tu carrito está vacío
                              </li>
                            ) : (
                              state.items.map((item) => (
                                <li key={item.variantId} className="flex py-6" data-testid={`cart-item-${item.variantId}`}>
                                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                    {item.imageUrl && (
                                      <Image
                                        src={item.imageUrl}
                                        alt={item.title}
                                        width={96}
                                        height={96}
                                        className="h-full w-full object-cover object-center"
                                      />
                                    )}
                                  </div>

                                  <div className="ml-4 flex flex-1 flex-col">
                                    <div>
                                      <div className="flex justify-between text-base font-medium text-gray-900">
                                        <h3>
                                          <Link 
                                            href={`/pictures/${item.slug}`}
                                            onClick={() => setCartOpen(false)}
                                            className="hover:text-gray-600"
                                          >
                                            {item.title}
                                          </Link>
                                        </h3>
                                        <p className="ml-4">{formatEuros(item.price)}</p>
                                      </div>
                                    </div>
                                    <div className="flex flex-1 items-end justify-between text-sm">
                                      <div className="flex items-center space-x-2">
                                        <button
                                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                          className="p-1 text-gray-400 hover:text-gray-600"
                                          data-testid={`decrease-quantity-${item.variantId}`}
                                        >
                                          <MinusIcon className="h-4 w-4" />
                                        </button>
                                        <span 
                                          className="text-gray-700 px-2 py-1 border rounded"
                                          data-testid={`quantity-${item.variantId}`}
                                        >
                                          {item.quantity}
                                        </span>
                                        <button
                                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                          disabled={item.stock ? item.quantity >= item.stock : false}
                                          className={`p-1 ${item.stock && item.quantity >= item.stock ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'}`}
                                          data-testid={`increase-quantity-${item.variantId}`}
                                        >
                                          <PlusIcon className="h-4 w-4" />
                                        </button>
                                      </div>

                                      <div className="flex">
                                        <button
                                          type="button"
                                          onClick={() => removeItem(item.variantId)}
                                          className="font-medium text-red-600 hover:text-red-500"
                                          data-testid={`remove-item-${item.variantId}`}
                                        >
                                          <TrashIcon className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              ))
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {state.items.length > 0 && (
                      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <p>Subtotal</p>
                          <p data-testid="cart-total">{getFormattedTotal()}</p>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500">
                          Envío e impuestos calculados al finalizar la compra.
                        </p>
                        <div className="mt-6">
                          <Link
                            href="/checkout"
                            onClick={() => setCartOpen(false)}
                            className="flex items-center justify-center rounded-md border border-transparent bg-gray-900 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-gray-800 transition-colors"
                            data-testid="checkout-button"
                          >
                            Finalizar compra
                          </Link>
                        </div>
                        <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                          <p>
                            o{' '}
                            <button
                              type="button"
                              className="font-medium text-gray-900 hover:text-gray-600"
                              onClick={() => setCartOpen(false)}
                            >
                              Continuar comprando
                              <span aria-hidden="true"> &rarr;</span>
                            </button>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}