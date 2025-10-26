import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "../components/Layout";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { formatPrice } from "../domain/order";
import Link from "next/link";

interface Order {
  id: string;
  customerEmail: string;
  customerName: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    total: number;
    variant?: {
      product?: {
        title: string;
        slug: string;
        images: Array<{
          url: string;
          altText?: string;
          isPrimary: boolean;
        }>;
      };
    };
  }>;
}

export default function OrderConfirmationPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);

        if (!response.ok) {
          throw new Error("Order not found");
        }

        const orderData = await response.json();
        setOrder(orderData);
      } catch (error) {
        console.error("Error fetching order:", error);
        setError("No se pudo encontrar la información del pedido.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <Layout title="Confirmación de pedido - Miguel Soro">
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Cargando información del pedido...
          </p>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout title="Error - Miguel Soro">
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="text-red-500 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Pedido no encontrado
          </h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link
            href="/"
            className="inline-block bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </Layout>
    );
  }

  const isPaid = order.status === "PAID";

  return (
    <Layout title="Confirmación de pedido - Miguel Soro">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1
            className="text-3xl font-bold text-gray-900 mb-2"
            data-testid="confirmation-title"
          >
            ¡Gracias por tu pedido!
          </h1>
          <p className="text-lg text-gray-600">
            Tu pedido #{order.id.slice(-8)} ha sido{" "}
            {isPaid ? "procesado" : "recibido"} exitosamente.
          </p>
        </div>

        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">
                Información del cliente
              </h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Nombre:</span>{" "}
                  {order.customerName}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {order.customerEmail}
                </p>
                <p>
                  <span className="font-medium">Estado:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isPaid
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {isPaid ? "Pagado" : "Pendiente"}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">
                Detalles del pedido
              </h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Número:</span> #
                  {order.id.slice(-8)}
                </p>
                <p>
                  <span className="font-medium">Fecha:</span>{" "}
                  {new Date(order.createdAt).toLocaleDateString("es-ES")}
                </p>
                <p>
                  <span className="font-medium">Total:</span>{" "}
                  <span className="text-lg font-bold">
                    {formatPrice(order.total)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Productos</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 border-b last:border-b-0"
                  data-testid={`order-item-${item.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-sm">
                      <h3 className="font-medium">
                        {item.variant?.product?.title}
                      </h3>
                      <p className="text-gray-500">Cantidad: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(item.total)}</p>
                    <p className="text-sm text-gray-500">
                      {formatPrice(item.price)} c/u
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          {isPaid ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-green-800">
                ✅ Tu pago ha sido procesado correctamente. Te contactaremos
                pronto para coordinar la entrega.
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-yellow-800">
                ⏳ Tu pedido está pendiente de pago. Si ya has pagado, puede
                tardar unos minutos en actualizarse.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors text-center"
            >
              Continuar comprando
            </Link>
            <Link
              href="/contact"
              className="inline-block border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors text-center"
            >
              Contactar soporte
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
