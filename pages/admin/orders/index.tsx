import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { isAuthenticated } from '../../../lib/auth';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { formatPrice } from '../../../domain/order';
import { orderRepository } from '../../../infra/dependencies';
import Link from 'next/link';

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
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
            <p className="mt-2 text-sm text-gray-700">
              Gestiona todos los pedidos de la tienda
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
            <div className="text-sm text-gray-500">Total pedidos</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{orderStats.PAID || 0}</div>
            <div className="text-sm text-gray-500">Pagados</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-yellow-600">{orderStats.PENDING || 0}</div>
            <div className="text-sm text-gray-500">Pendientes</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{orderStats.PROCESSING || 0}</div>
            <div className="text-sm text-gray-500">Procesando</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por cliente, email o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-testid="orders-search"
              />
            </div>
            <div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pedido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No se encontraron pedidos
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50" data-testid={`order-row-${order.id}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">#{order.id.slice(-8)}</div>
                          <div className="text-gray-500">{order._count.items} productos</div>
                          {order.paypalOrderId && (
                            <div className="text-xs text-blue-600">PayPal: {order.paypalOrderId.slice(-8)}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{order.customerName}</div>
                          <div className="text-gray-500">{order.customerEmail}</div>
                          {order.customerPhone && (
                            <div className="text-gray-500">{order.customerPhone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                          {statusLabels[order.status as keyof typeof statusLabels] || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          data-testid={`view-order-${order.id}`}
                        >
                          Ver detalles
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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