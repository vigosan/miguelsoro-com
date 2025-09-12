import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Toaster, toast } from "react-hot-toast";
import { 
  ShoppingBagIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/utils/cn";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-gray-100 text-gray-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const statusLabels = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  SHIPPED: "Enviado", 
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

const statusIcons = {
  PENDING: ClockIcon,
  PAID: CheckCircleIcon,
  SHIPPED: TruckIcon,
  DELIVERED: CheckCircleIcon,
  CANCELLED: ClockIcon,
};

type OrderItem = {
  id: string;
  productTitle: string;
  productType: string;
  quantity: number;
  unitPrice: number;
};

type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: keyof typeof statusLabels;
  createdAt: string;
  items: OrderItem[];
};

type OrderStats = {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      } else {
        toast.error('Error al cargar los pedidos');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error al cargar los pedidos');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/orders/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchOrders(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: keyof typeof statusLabels) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        toast.success('Estado actualizado correctamente');
        // Update local state
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        // Refresh stats
        fetchStats();
      } else {
        toast.error('Error al actualizar el estado');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const handleViewOrder = (orderId: string) => {
    toast.success(`Ver orden ${orderId} (funcionalidad pendiente)`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout title="Pedidos - Admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pedidos</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Gestiona todos los pedidos y ventas
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-lg bg-gray-900">
                <ShoppingBagIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Pedidos</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-lg bg-green-500">
                <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Completados</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-lg bg-yellow-500">
                <ClockIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Pendientes</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-lg bg-purple-500">
                <TruckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Ingresos</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Select className="w-full sm:w-48">
            <option>Todos los estados</option>
            <option>Pendiente</option>
            <option>Pagado</option>
            <option>Enviado</option>
            <option>Entregado</option>
            <option>Cancelado</option>
          </Select>
          <Input
            type="search"
            placeholder="Buscar por cliente..."
            className="flex-1 sm:max-w-md"
          />
        </div>

        {/* Orders Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">Pedidos Recientes</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : orders.map((order) => {
              const StatusIcon = statusIcons[order.status];
              return (
                <div key={order.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex items-start space-x-3 sm:space-x-4 min-w-0">
                      <div className="flex-shrink-0">
                        <StatusIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                          {order.items.map(item => item.productTitle).join(', ')}
                        </h4>
                        <p className="text-sm text-gray-900 truncate">
                          {order.items.map(item => `${item.quantity}x ${item.productType}`).join(', ')}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          Cliente: {order.customerName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {order.customerEmail}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4">
                      <div className="text-left sm:text-right">
                        <p className="text-base sm:text-lg font-bold text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as keyof typeof statusLabels)}
                          className={cn(
                            "text-xs font-medium border-0 rounded-full px-2 sm:px-2.5 py-0.5 focus:ring-2 focus:ring-gray-500 cursor-pointer",
                            statusColors[order.status]
                          )}
                        >
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button 
                        onClick={() => handleViewOrder(order.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 cursor-pointer"
                        title="Ver detalles"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {!loading && orders.length === 0 && (
            <div className="text-center py-12">
              <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                No hay pedidos
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Los pedidos aparecerán aquí cuando los clientes realicen compras.
              </p>
            </div>
          )}
        </div>

        <Toaster position="top-right" />
      </div>
    </AdminLayout>
  );
}