import { AdminLayout } from "@/components/admin/AdminLayout";
import { 
  ShoppingBagIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/utils/cn";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-blue-100 text-blue-800",
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

// Mock data - esto se reemplazará con datos reales de la base de datos
const mockOrders = [
  {
    id: "1",
    pictureTitle: "Abraham Olano - Equipo ONCE",
    customerName: "Juan Pérez",
    customerEmail: "juan@example.com",
    totalAmount: 45000, // €450.00
    status: "DELIVERED" as const,
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2", 
    pictureTitle: "Ercole Baldini - El Treno de Forlì",
    customerName: "María García",
    customerEmail: "maria@example.com", 
    totalAmount: 38000, // €380.00
    status: "SHIPPED" as const,
    createdAt: "2024-01-20T14:20:00Z",
  },
  {
    id: "3",
    pictureTitle: "Miguel Indurain - Maglia Rosa", 
    customerName: "Carlos López",
    customerEmail: "carlos@example.com",
    totalAmount: 52000, // €520.00
    status: "PAID" as const,
    createdAt: "2024-01-22T09:45:00Z",
  },
];

export default function AdminOrders() {
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
            <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
            <p className="mt-2 text-gray-600">
              Gestiona todos los pedidos y ventas
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-500">
                <ShoppingBagIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500">
                <CheckCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-500">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-500">
                <TruckIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ingresos</p>
                <p className="text-2xl font-bold text-gray-900">€1.350</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-4">
          <select className="rounded-md border-gray-300 text-sm">
            <option>Todos los estados</option>
            <option>Pendiente</option>
            <option>Pagado</option>
            <option>Enviado</option>
            <option>Entregado</option>
            <option>Cancelado</option>
          </select>
          <input
            type="search"
            placeholder="Buscar por cliente..."
            className="flex-1 max-w-md rounded-md border-gray-300 text-sm"
          />
        </div>

        {/* Orders Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Pedidos Recientes</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {mockOrders.map((order) => {
              const StatusIcon = statusIcons[order.status];
              return (
                <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <StatusIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {order.pictureTitle}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Cliente: {order.customerName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.customerEmail}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          statusColors[order.status]
                        )}>
                          {statusLabels[order.status]}
                        </span>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {mockOrders.length === 0 && (
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
      </div>
    </AdminLayout>
  );
}