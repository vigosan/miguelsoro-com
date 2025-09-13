import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { isAuthenticated } from '../../../lib/auth';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { formatPrice } from '../../../domain/order';
import { orderRepository } from '../../../infra/dependencies';
import Link from 'next/link';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';

interface Order {
  id: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  paypalOrderId?: string;
  status: string;
  total: number;
  createdAt: string;
  _count: {
    items: number;
  };
}

interface Props {
  orders: Order[];
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

const statusLabels = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  PROCESSING: 'Procesando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
};

export default function AdminOrdersPage({ orders }: Props) {
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = searchTerm === '' || 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.includes(searchTerm);
    
    return matchesFilter && matchesSearch;
  });

  const orderStats = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AdminLayout title="Gestión de Pedidos">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pedidos</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Gestiona todos los pedidos de la tienda
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
            <div className="text-sm text-gray-500">Total pedidos</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{orderStats.PAID || 0}</div>
            <div className="text-sm text-gray-500">Pagados</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">{orderStats.PENDING || 0}</div>
            <div className="text-sm text-gray-500">Pendientes</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{orderStats.PROCESSING || 0}</div>
            <div className="text-sm text-gray-500">Procesando</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-48"
            data-testid="orders-filter"
          >
            <option value="all">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="PAID">Pagado</option>
            <option value="PROCESSING">Procesando</option>
            <option value="SHIPPED">Enviado</option>
            <option value="DELIVERED">Entregado</option>
            <option value="CANCELLED">Cancelado</option>
            <option value="REFUNDED">Reembolsado</option>
          </Select>
          <Input
            type="search"
            placeholder="Buscar pedidos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 sm:max-w-md"
            data-testid="orders-search"
          />
        </div>

        {/* Orders Grid - Minimalist Design */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 gap-1 divide-y divide-gray-100">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50 transition-colors gap-3 sm:gap-0"
                data-testid={`order-row-${order.id}`}
              >
                {/* Left side - Order info and customer */}
                <div className="flex items-start space-x-4 min-w-0 flex-1">
                  {/* Order info */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      #{order.id.slice(-8)} - {order.customerName}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                      <span>{order.customerEmail}</span>
                      <span>·</span>
                      <span>{order._count.items} productos</span>
                      <span>·</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatPrice(order.total)}
                      </span>
                      <span>·</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                        {statusLabels[order.status as keyof typeof statusLabels] || order.status}
                      </span>
                      <span>·</span>
                      <span>
                        {new Date(order.createdAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {order.paypalOrderId && (
                      <div className="text-xs text-blue-600 mt-1">
                        PayPal: {order.paypalOrderId.slice(-8)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side - Actions only */}
                <div className="flex items-center space-x-1 flex-shrink-0 self-start sm:self-center">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
                    title="Ver detalles"
                    data-testid={`view-order-${order.id}`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                {(filter !== 'all' || searchTerm) ? 'No se encontraron pedidos' : 'No hay pedidos'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {(filter !== 'all' || searchTerm) ? 'Intenta cambiar los filtros de búsqueda.' : 'Los pedidos aparecerán aquí cuando se realicen.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const authenticated = isAuthenticated(context.req);

  if (!authenticated) {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    };
  }

  try {
    const orders = await orderRepository.findAll();

    return {
      props: {
        orders: orders.map(order => ({
          id: order.id,
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          customerPhone: null, // OrderSummary doesn't include phone
          paypalOrderId: null, // OrderSummary doesn't include paypalOrderId
          status: order.status,
          total: order.totalAmount,
          createdAt: order.createdAt,
          _count: {
            items: order.items.length,
          },
        })),
      },
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return {
      props: {
        orders: [],
      },
    };
  }
};