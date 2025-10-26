import { GetStaticProps } from "next";
import Link from "next/link";
import Image from "next/image";
import { Layout } from "@/components/Layout";
import { WebsiteStructuredData } from "@/components/seo/StructuredData";
import { DatabasePictureRepository } from "@/infra/DatabasePictureRepository";
import { Picture } from "@/domain/picture";

interface IndexPageProps {
  featuredPictures: Picture[];
}

export default function IndexPage({ featuredPictures }: IndexPageProps) {
  return (
    <>
      <WebsiteStructuredData />
      <Layout
        title="Miguel Soro - Arte Ciclístico Original | Ex-Ciclista Profesional Reconocido por Forbes"
        description="Descubre la colección única de Miguel Soro: centenares de obras de leyendas del ciclismo. Ex-profesional (1998-2003) con exposiciones internacionales en 6 países. Técnicas mixtas acrílico y collage. Reconocido por Forbes y Giant Bicycles."
        url="https://www.miguelsoro.com"
      >
        {/* Hero Section - Simple */}
        <section className="relative bg-black -mx-6 lg:-mx-24 pt-20">
          <div className="relative min-h-[60vh] lg:min-h-[70vh]">
            <div className="absolute inset-0 bg-black/70"></div>
            <Image
              src="/estudio.webp"
              alt="Miguel Soro en su estudio"
              fill
              className="object-cover grayscale"
              priority
            />
            <div className="relative z-10 flex items-center min-h-[60vh] lg:min-h-[70vh]">
              <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-16">
                <div className="mb-12">
                  <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white leading-[0.9] tracking-tight uppercase">
                    Miguel
                    <br />
                    Soro
                  </h1>
                </div>
                <div className="max-w-2xl">
                  <p className="text-xl md:text-2xl text-white/90 leading-relaxed mb-8">
                    Del pelotón profesional al lienzo. Arte ciclista con la
                    autenticidad de quien vivió el deporte desde dentro.
                  </p>
                  <Link
                    href="/obra"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-medium hover:bg-gray-200 transition-colors uppercase tracking-wider text-sm"
                  >
                    <span>Ver colección</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-24 lg:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-20">
              <div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-black mb-8 leading-tight">
                  La autenticidad de quien vivió el ciclismo desde dentro
                </h2>
              </div>
              <div className="space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Miguel Soro corrió profesionalmente durante cinco años
                  (1998-2003) con equipos portugueses e italianos, participó en
                  el Mundial Junior de Ecuador y ganó etapas en el Circuito
                  Montañés.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Como artista autodidacta, desarrolló una técnica única de
                  acrílico y collage que captura la velocidad, la estrategia y
                  la emoción del pelotón.
                </p>
                <div className="pt-4">
                  <Link
                    href="/biografia"
                    className="text-black hover:text-gray-600 transition-colors inline-flex items-center gap-2 font-medium"
                  >
                    <span>Leer biografía completa</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technique Section */}
        <section className="py-24 lg:py-32 bg-black text-white -mx-6 lg:-mx-24 px-6 lg:px-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
              <div>
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-light mb-6 leading-none">
                  Acrílico &<br />
                  Collage
                </h2>
                <div className="w-24 h-px bg-white mb-8"></div>
                <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                  Cada obra combina pintura acrílica con recortes de periódicos.
                  Los gestos atléticos se transforman en composiciones que
                  capturan la velocidad y emoción del pelotón profesional.
                </p>
              </div>
              <div className="relative aspect-[4/3]">
                <Image
                  src="/process.webp"
                  alt="Proceso artístico de Miguel Soro"
                  fill
                  className="object-cover grayscale"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Works Section */}
        <section className="py-24 lg:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="mb-16">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-light text-black mb-4">
                Obras destacadas
              </h2>
              <div className="w-24 h-px bg-black"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200">
              {featuredPictures.slice(0, 6).map((picture) => (
                <Link
                  key={picture.id}
                  href={`/pictures/${picture.slug}`}
                  className="group relative bg-white aspect-square overflow-hidden block"
                >
                  <Image
                    src={picture.imageUrl}
                    alt={picture.title}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <h3 className="text-white text-xl font-light">
                      {picture.title}
                    </h3>
                    <p className="text-gray-300 text-sm mt-1">
                      {picture.size}cm
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/obra"
                className="inline-block px-10 py-4 bg-black text-white hover:bg-gray-800 transition-colors"
              >
                Ver colección completa
              </Link>
            </div>
          </div>
        </section>

        {/* Call to Action Final */}
        <section className="py-24 lg:py-32 bg-black text-white -mx-6 lg:-mx-24 px-6 lg:px-24">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 leading-tight">
              Descubre la colección completa
            </h2>
            <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Cada obra captura la esencia del pelotón profesional con
              autenticidad única.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/obra"
                className="px-10 py-4 bg-white text-black hover:bg-gray-200 transition-colors"
              >
                Ver colección
              </Link>
              <Link
                href="/contacto"
                className="px-10 py-4 border border-white text-white hover:bg-white hover:text-black transition-colors"
              >
                Contacto
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps<IndexPageProps> = async () => {
  try {
    const pictureRepository = new DatabasePictureRepository();
    const allPictures = await pictureRepository.findAll();

    // Get first 6 pictures as featured works for the landing page
    const featuredPictures = allPictures.slice(0, 6);

    return {
      props: {
        featuredPictures,
      },
      // Revalidate every hour (3600 seconds)
      revalidate: 3600,
    };
  } catch (error) {
    console.error("Error fetching data for homepage:", error);

    // Return empty arrays as fallback
    return {
      props: {
        featuredPictures: [],
      },
      // On error, retry after 5 minutes
      revalidate: 300,
    };
  }
};
