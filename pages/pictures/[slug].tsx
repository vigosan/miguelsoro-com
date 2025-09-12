import Image from "next/image";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatEuros } from "@/domain/order";
import { usePicturePublic } from "@/hooks/usePicturesPublic";
import { getPictureStatus } from "@/domain/picture";
import { useRouter } from "next/router";
import { ArtworkStructuredData, BreadcrumbStructuredData } from "@/components/seo/StructuredData";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { useCart } from "../../contexts/CartContext";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

const PictureDetail = () => {
  const router = useRouter();
  const slug = Array.isArray(router.query.slug)
    ? router.query.slug[0]
    : router.query.slug;
  const { data: picture, isLoading } = usePicturePublic(slug);
  const { addItem, toggleCart } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  if (isLoading) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  if (!picture) {
    return (
      <Layout>
        <div>No se encontró el picture</div>
      </Layout>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = `${picture.title} - Miguel Soro`;
  const shareText = picture.description;

  const pictureUrl = `https://www.miguelsoro.com/pictures/${slug}`;
  const pictureImageUrl = picture.imageUrl;

  const breadcrumbItems = [
    { name: "Inicio", href: "/", current: false },
    { name: "Obra", href: "/", current: false },
    { name: picture.title, href: `/pictures/${slug}`, current: true }
  ];

  const structuredBreadcrumbItems = [
    { name: "Inicio", url: "https://www.miguelsoro.com" },
    { name: "Obra", url: "https://www.miguelsoro.com" },
    { name: picture.title, url: pictureUrl }
  ];

  const handleAddToCart = async () => {
    if (!picture || getPictureStatus(picture) !== 'AVAILABLE' || picture.price <= 0) {
      return;
    }

    setIsAddingToCart(true);
    
    try {
      // Para trabajar con nuestro sistema actual, vamos a crear un item compatible
      // Más adelante cuando tengas ProductVariants, podrás usar el variantId real
      const cartItem = {
        variantId: `picture_${picture.id}`, // ID temporal para el sistema actual
        productId: picture.id,
        title: picture.title,
        price: picture.price, // El precio ya está en euros en la DB
        slug: picture.slug,
        imageUrl: picture.imageUrl,
        stock: picture.stock || 1, // Include stock information
      };

      addItem(cartItem);
      
      toast.success(`"${picture.title}" añadido al carrito`, {
        duration: 3000,
      });
      
      // Abrir el carrito después de añadir
      setTimeout(() => {
        toggleCart();
      }, 500);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Error al añadir al carrito');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <>
      <ArtworkStructuredData artwork={picture} url={pictureUrl} />
      <BreadcrumbStructuredData items={structuredBreadcrumbItems} />
      <Layout
        title={`${picture.title} - Miguel Soro | Arte Ciclístico Original`}
        description={`${picture.description} Obra original de Miguel Soro, ex-ciclista profesional. Acrílico y collage ${picture.size}cm. ${picture.price > 0 ? `Precio: ${formatEuros(picture.price)}` : 'Consultar precio'}.`}
        image={pictureImageUrl}
        url={pictureUrl}
      >
        <Breadcrumbs items={breadcrumbItems} />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
        {/* Imagen Principal */}
        <div className="space-y-6">
          <div className="relative">
            <div className="aspect-square relative bg-gray-900 p-6">
              <Image
                src={picture.imageUrl}
                alt={`${picture.title} - Arte ciclístico original de Miguel Soro. Obra única ${picture.size}cm, acrílico y collage sobre lienzo${getPictureStatus(picture) === 'NOT_AVAILABLE' ? ' [NO DISPONIBLE]' : getPictureStatus(picture) === 'AVAILABLE' ? ' disponible para compra' : ''}`}
                className="h-full w-full object-cover"
                width={600}
                height={600}
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              <div className="absolute top-2 right-2">
                {getPictureStatus(picture) === 'AVAILABLE' && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-500 text-white">
                    Disponible
                  </span>
                )}
                {getPictureStatus(picture) === 'NOT_AVAILABLE' && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-500 text-white">
                    No disponible
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Compartir */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Compartir:</h3>
            <div className="flex items-center space-x-3">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              >
                <span className="sr-only">Compartir en Facebook</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`${shareTitle} - ${shareText.substring(0, 100)}...`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <span className="sr-only">Compartir en Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11.4678 8.77491L17.2961 2H15.915L10.8543 7.88256L6.81232 2H2.15039L8.26263 10.8955L2.15039 18H3.53159L8.87581 11.7878L13.1444 18H17.8063L11.4675 8.77491H11.4678ZM9.57608 10.9738L8.95678 10.0881L4.02925 3.03974H6.15068L10.1273 8.72795L10.7466 9.61374L15.9156 17.0075H13.7942L9.57608 10.9742V10.9738Z" />
                </svg>
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${shareTitle} - ${shareUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
              >
                <span className="sr-only">Compartir en WhatsApp</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
              </a>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
                  } else {
                    navigator.clipboard.writeText(shareUrl);
                    alert('¡Enlace copiado al portapapeles!');
                  }
                }}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <span className="sr-only">Copiar enlace</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Información de la Obra */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {picture.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{picture.size}</span>
              <span>•</span>
              <span>Obra original</span>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h2>
            <p className="text-gray-700 leading-relaxed">{picture.description}</p>
          </div>

          {/* Precio y Acciones */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
            <div className="mb-6">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {picture.price > 0 ? formatEuros(picture.price) : "Consultar precio"}
              </div>
              {picture.price === 0 && (
                <p className="text-sm text-gray-600">
                  Precio disponible bajo consulta. Contacta para más información.
                </p>
              )}
            </div>
            
            <div className="space-y-3">
              {getPictureStatus(picture) === 'AVAILABLE' && picture.price > 0 ? (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="w-full flex items-center justify-center rounded-lg bg-gray-900 py-3 px-6 text-base font-medium text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="add-to-cart-button"
                >
                  {isAddingToCart ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Añadiendo...
                    </>
                  ) : (
                    <>
                      <ShoppingCartIcon className="w-5 h-5 mr-2" />
                      Añadir al carrito
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  className="w-full flex items-center justify-center rounded-lg bg-gray-400 py-3 px-6 text-base font-medium text-white cursor-not-allowed"
                  disabled
                >
                  {getPictureStatus(picture) === 'NOT_AVAILABLE' ? 'Obra no disponible' : 'Consultar disponibilidad'}
                </button>
              )}
              
              <a
                href={`mailto:info@miguelsoro.com?subject=Consulta sobre la obra: ${encodeURIComponent(picture.title)}`}
                className="w-full flex items-center justify-center rounded-lg border border-gray-300 bg-white py-3 px-6 text-base font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Enviar consulta por email
              </a>
            </div>
          </div>

          {/* Información Adicional */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Técnica:</span> Acrílico y collage sobre lienzo<br />
              <span className="font-medium">Estado:</span> Obra única y original firmada por el artista
            </p>
          </div>
        </div>
      </div>
      </Layout>
    </>
  );
};

export default PictureDetail;
