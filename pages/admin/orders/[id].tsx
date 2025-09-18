import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { OrderWithDetails } from '../../../infra/OrderRepository';

interface OrderDetailsProps {
  order: OrderWithDetails | null;
  loading: boolean;
  error: string | null;
}

function OrderDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/orders/${id}`);

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Cargando detalles del pedido...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Volver
          </button>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Pedido no encontrado</h3>
          <p className="text-yellow-700">No se pudo encontrar el pedido con ID: {id}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
          >
            Volver
          </button>
        </div>
      </AdminLayout>
    );
  }

  const formatCurrency = (amount: number | undefined) => {
    if (typeof amount !== 'number') return '€0.00';
    return (amount / 100).toFixed(2) + '€';
  };

  const formatDate = (date: Date | string) => {
    if (!date) return 'Fecha no disponible';
    return new Date(date).toLocaleString('es-ES');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800';
      case 'DELIVERED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Pagado';
      case 'PENDING':
        return 'Pendiente';
      case 'SHIPPED':
        return 'Enviado';
      case 'DELIVERED':
        return 'Entregado';
      default:
        return status;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Pedido #{order.id ? order.id.slice(-8).toUpperCase() : 'N/A'}
            </h1>
            <p className="text-gray-600">
              Creado el {formatDate(order.createdAt)}
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            ← Volver
          </button>
        </div>

        {/* Status */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Estado del Pedido</h2>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </span>
        </div>

        {/* Customer Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Información del Cliente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <p className="mt-1 text-sm text-gray-900">{order.customerName || 'No disponible'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{order.customerEmail || 'No disponible'}</p>
            </div>
            {order.customerPhone && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <p className="mt-1 text-sm text-gray-900">{order.customerPhone}</p>
              </div>
            )}
            {order.shippingAddress && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Dirección de Envío</label>
                <p className="mt-1 text-sm text-gray-900">{order.shippingAddress}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Productos</h2>
          <div className="space-y-4">
            {order.items && order.items.length > 0 ? order.items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                {item.variant?.product?.images && item.variant.product.images.length > 0 && (
                  <Image
                    src={item.variant.product.images[0].url}
                    alt={item.variant.product.title}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {item.variant?.product?.title || 'Producto'}
                  </h3>
                  {item.variant?.product?.productType && (
                    <p className="text-sm text-gray-600">
                      {item.variant.product.productType.displayName}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-600">Cantidad: {item.quantity}</span>
                    <span className="text-sm text-gray-600">
                      Precio unitario: {formatCurrency(item.price)}
                    </span>
                  </div>
                </div>
                <div className="text-lg font-medium">
                  {formatCurrency(item.total)}
                </div>
              </div>
            )) : (
              <p className="text-gray-500">No hay productos en este pedido</p>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Resumen del Pedido</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Impuestos:</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Envío:</span>
              <span>{formatCurrency(order.shipping)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-medium text-lg">
              <span>Total:</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        {order.paypalOrderId && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Información del Pago</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">ID de Transacción PayPal</label>
              <p className="mt-1 text-sm text-gray-900 font-mono">{order.paypalOrderId}</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default OrderDetails;