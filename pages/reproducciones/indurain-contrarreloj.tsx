import { useState } from "react";
import Image from "next/image";
import { GetStaticProps } from "next";
import { toast } from "react-hot-toast";
import { Layout } from "@/components/Layout";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import { formatEuros } from "@/domain/order";
import { getPictureStatus, Picture } from "@/domain/picture";
import { DatabasePictureRepository } from "@/infra/DatabasePictureRepository";
import { useCart } from "../../contexts/CartContext";

const SLUG = "indurain-contrarreloj";

interface IndurainPageProps {
  picture: Picture | null;
}

export default function IndurainPage({ picture }: IndurainPageProps) {
  const { addItem, toggleCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const available =
    picture != null &&
    getPictureStatus(picture) === "AVAILABLE" &&
    picture.price > 0;

  const handleAddToCart = async () => {
    if (!picture || !available) return;
    setIsAdding(true);
    try {
      const response = await fetch(
        `/api/product-variants?productId=${picture.id}`,
      );
      if (!response.ok) throw new Error("No se pudo obtener la variante");
      const variants = await response.json();
      if (!variants?.length) throw new Error("Sin variantes disponibles");

      addItem({
        variantId: variants[0].id,
        productId: picture.id,
        title: picture.title,
        price: picture.price,
        slug: picture.slug,
        imageUrl: picture.imageUrl,
        stock: picture.stock || 1,
      });
      toast.success(`"${picture.title}" añadido al carrito`);
      setTimeout(() => toggleCart(), 500);
    } catch (error) {
      console.error("Error adding litografia to cart:", error);
      toast.error("Error al añadir al carrito");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Layout
      title="Litografía Miguel Indurain — Edición firmada | Miguel Soro"
      description="Litografía original de Miguel Soro sobre Miguel Indurain. Edición limitada, numerada y firmada a mano. Reproducción de arte ciclista."
      image="/reproducciones/indurain-firmada.webp"
      url="https://www.miguelsoro.com/reproducciones/indurain-contrarreloj"
    >
      <div className="py-12 lg:py-16">
        {/* Hero */}
        <Reveal className="mb-10">
          <SectionLabel prefix="Reproducciones">Edición firmada</SectionLabel>
          <h1 className="font-[family-name:var(--font-poster)] uppercase text-6xl md:text-7xl lg:text-8xl leading-[0.85] text-gray-900">
            Miguel
            <br />
            <span className="text-accent-ink">Indurain</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Litografía sobre la leyenda del Banesto.
          </p>
        </Reveal>

        <Reveal clip className="relative overflow-hidden rounded-lg bg-gray-100">
          <Image
            src="/reproducciones/indurain-firmada.webp"
            alt="Litografía de Miguel Indurain firmada por Miguel Soro"
            width={1200}
            height={890}
            priority
            className="h-auto w-full object-cover"
          />
          <span className="absolute left-4 top-4 rounded-sm bg-accent px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-black">
            Edición limitada
          </span>
        </Reveal>

        {/* Buy block */}
        <Reveal className="mt-8 border-y border-gray-200 py-8">
          <div className="flex items-baseline justify-between">
            <span className="font-[family-name:var(--font-poster)] text-4xl text-gray-900">
              {picture ? formatEuros(picture.price) : "100 €"}
            </span>
            {available && (
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-accent-ink">
                Quedan {picture.stock}{" "}
                {picture.stock === 1 ? "ejemplar" : "ejemplares"}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Litografía numerada y firmada a mano por el artista.
          </p>
          <p className="mt-1 text-xs text-gray-500">IVA no incluido</p>
          <div className="mt-6">
            {available ? (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full rounded-sm bg-gray-900 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-gray-700 active:scale-[0.99] disabled:opacity-50"
                data-testid="litografia-add-to-cart"
              >
                {isAdding
                  ? "Añadiendo…"
                  : `Añadir al carrito — ${formatEuros(picture.price)}`}
              </button>
            ) : (
              <div className="rounded-sm bg-gray-100 py-4 text-center text-sm font-medium text-gray-600">
                {picture
                  ? "Edición agotada"
                  : "Disponible próximamente"}
              </div>
            )}
          </div>
        </Reveal>

        {/* La pieza */}
        <section className="mt-16">
          <Reveal>
            <SectionLabel prefix="01" paren>
              La pieza
            </SectionLabel>
          </Reveal>
          <Reveal delay={120}>
            <h2 className="font-[family-name:var(--font-poster)] uppercase text-4xl md:text-5xl leading-[0.9] text-gray-900">
              La contrarreloj
              <br />
              perfecta
            </h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-gray-700">
              <p>
                Cinco Tours consecutivos. Indurain sobre la cabra, inclinado,
                imbatible contra el crono. Miguel Soro recorta la prensa de la
                época y la reconstruye capa sobre capa: el maillot amarillo, el
                Banesto, la épica de los noventa.
              </p>
              <p>
                Esta litografía reproduce la obra original en edición limitada,
                cada ejemplar numerado y firmado a mano.
              </p>
            </div>
          </Reveal>
        </section>

        {/* El proceso */}
        <section className="mt-16">
          <Reveal>
            <SectionLabel prefix="02" paren>
              El proceso
            </SectionLabel>
          </Reveal>
          <Reveal delay={120}>
            <h2 className="mb-6 font-[family-name:var(--font-poster)] uppercase text-4xl md:text-5xl leading-[0.9] text-gray-900">
              Cómo nace
              <br />
              el cuadro
            </h2>
          </Reveal>
          <div className="space-y-6">
            <Reveal clip className="overflow-hidden rounded-lg">
              <Image
                src="/reproducciones/indurain-proceso-2.webp"
                alt="El collage de base antes de la pintura"
                width={1200}
                height={1168}
                className="h-auto w-full object-cover"
              />
            </Reveal>
            <Reveal delay={100} clip className="overflow-hidden rounded-lg">
              <Image
                src="/reproducciones/indurain-proceso-1.webp"
                alt="Primeros trazos de acrílico sobre el papel"
                width={900}
                height={1600}
                className="h-auto w-full object-cover"
              />
            </Reveal>
          </div>
        </section>

        {/* En el estudio (vídeo) */}
        <section className="mt-16">
          <Reveal>
            <SectionLabel prefix="03" paren>
              En el estudio
            </SectionLabel>
          </Reveal>
          <Reveal delay={120}>
            <h2 className="font-[family-name:var(--font-poster)] uppercase text-4xl md:text-5xl leading-[0.9] text-gray-900">
              Miguel
              <br />
              pintando
            </h2>
            <p className="mt-4 mb-6 text-lg text-gray-600">
              El artista trabajando sobre el original que dio origen a esta
              litografía.
            </p>
          </Reveal>
          <div className="space-y-6">
            <Reveal className="overflow-hidden rounded-lg bg-black">
              <video
                src="/reproducciones/indurain-proceso-video-1.mp4"
                controls
                preload="metadata"
                playsInline
                className="h-auto w-full"
              />
            </Reveal>
            <Reveal delay={100} className="overflow-hidden rounded-lg bg-black">
              <video
                src="/reproducciones/indurain-proceso-video-2.mp4"
                controls
                preload="metadata"
                playsInline
                className="h-auto w-full"
              />
            </Reveal>
          </div>
        </section>

        {/* Ficha técnica */}
        <section className="mt-16">
          <Reveal>
            <dl className="border-t border-gray-200">
              {[
                ["Técnica", "Litografía sobre papel"],
                ["Edición", "Limitada, numerada"],
                ["Firma", "Firmada a mano por el artista"],
                ["Precio", picture ? formatEuros(picture.price) : "100 €"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between border-b border-gray-200 py-3 text-sm"
                >
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="font-medium text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </section>

        {/* Cierre */}
        <section className="mt-16 -mx-6 bg-gray-900 px-6 py-16 text-center text-white lg:-mx-24 lg:px-24">
          <Reveal>
            <h3 className="font-[family-name:var(--font-poster)] uppercase text-3xl md:text-4xl">
              Llévate a <span className="text-accent">Indurain</span>
            </h3>
            <p className="mx-auto mt-3 max-w-md text-white/70">
              Edición limitada. Cuando se agote, no habrá más.
            </p>
            {available && (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className="mt-6 rounded-sm bg-accent px-8 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-black transition-colors hover:bg-accent-ink active:scale-[0.99] disabled:opacity-50"
              >
                {isAdding ? "Añadiendo…" : `Añadir al carrito — ${formatEuros(picture.price)}`}
              </button>
            )}
          </Reveal>
        </section>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<IndurainPageProps> = async () => {
  try {
    const repository = new DatabasePictureRepository();
    const picture = await repository.getPictureBySlug(SLUG);
    return {
      props: { picture: picture ?? null },
      revalidate: 3600,
    };
  } catch (error) {
    console.error("Error fetching Indurain litografia:", error);
    return { props: { picture: null }, revalidate: 300 };
  }
};
