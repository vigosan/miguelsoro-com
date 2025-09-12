import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { useProduct } from "@/hooks/useProduct";
import { formatPrice } from "@/domain/product";
import { 
  ArrowLeftIcon,
  ShoppingBagIcon,
  HeartIcon
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

export default function ProductPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { data: product, isLoading, error } = useProduct(typeof slug === "string" ? slug : undefined);
  const [isFavorite, setIsFavorite] = useState(false);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Producto no encontrado
          </h2>
          <p className="text-gray-600 mb-8">
            El producto que buscas no existe o ya no está disponible.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver al catálogo
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${product.title} - Miguel Soro`}>
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-gray-700">
            Inicio
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={`/pictures/${product.id}.webp`}
                alt={product.title}
                width={600}
                height={600}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">
                {product.productType.displayName}
              </p>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.title}
              </h1>
              <div className="flex items-center justify-between mb-6">
                <p className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.basePrice)}
                </p>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {isFavorite ? (
                    <HeartSolidIcon className="h-6 w-6 text-red-500" />
                  ) : (
                    <HeartIcon className="h-6 w-6 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Descripción
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4 pt-6 border-t">
              <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center">
                <ShoppingBagIcon className="h-5 w-5 mr-2" />
                Añadir al carrito
              </button>
              <button className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors">
                Consultar disponibilidad
              </button>
            </div>

            {/* Additional Info */}
            <div className="space-y-4 pt-6 border-t text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Envío</span>
                <span>Gratuito en España</span>
              </div>
              <div className="flex justify-between">
                <span>Entrega</span>
                <span>2-3 días laborables</span>
              </div>
              <div className="flex justify-between">
                <span>Devoluciones</span>
                <span>30 días</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back to catalog */}
        <div className="mt-16 pt-8 border-t">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver al catálogo
          </Link>
        </div>
      </div>
    </Layout>
  );
}