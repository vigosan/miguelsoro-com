import { GetStaticProps } from "next";
import Link from "next/link";
import Image from "next/image";
import { Layout } from "@/components/Layout";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import { useParallax } from "@/hooks/useParallax";
import { WebsiteStructuredData } from "@/components/seo/StructuredData";
import { DatabasePictureRepository } from "@/infra/DatabasePictureRepository";
import { Picture } from "@/domain/picture";

interface IndexPageProps {
  featuredPictures: Picture[];
  totalPictures: number;
}

export default function IndexPage({
  featuredPictures,
  totalPictures,
}: IndexPageProps) {
  const { ref: heroRef, offset: heroOffset } = useParallax<HTMLDivElement>(0.35);

  return (
    <>
      <WebsiteStructuredData numberOfItems={totalPictures} />
      <Layout
        title="Miguel Soro - Arte Ciclístico Original | Ex-Ciclista Profesional Reconocido por Forbes"
        description="Descubre la colección única de Miguel Soro: centenares de obras de leyendas del ciclismo. Ex-profesional (1998-2003) con exposiciones internacionales en 6 países. Técnicas mixtas acrílico y collage. Reconocido por Forbes y Giant Bicycles."
        url="https://www.miguelsoro.com"
        hero
      >
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative overflow-hidden bg-black -mx-6 -mt-12 lg:-mx-24 lg:-mt-16"
        >
          <div className="relative min-h-[80vh] lg:min-h-[92vh]">
            <div
              className="absolute inset-0 will-change-transform"
              style={{ transform: `translate3d(0, ${heroOffset}px, 0) scale(1.15)` }}
            >
              <Image
                src="/estudio.webp"
                alt="Miguel Soro en su estudio"
                fill
                className="object-cover grayscale"
                priority
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/55"></div>
            <div className="relative z-10 flex items-center min-h-[80vh] lg:min-h-[92vh]">
              <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-16 lg:pt-40">
                <p className="text-xs uppercase tracking-[0.35em] text-white/60 mb-6 animate-[hero-rise_1s_cubic-bezier(0.16,1,0.3,1)_0.05s_both]">
                  Arte ciclista — Ex-profesional 1998·2003
                </p>
                <div className="mb-12 overflow-hidden">
                  <h1 className="font-[family-name:var(--font-poster)] text-7xl md:text-8xl lg:text-[9rem] text-white leading-[0.85] tracking-tight uppercase drop-shadow-sm">
                    <span className="block animate-[hero-rise_1s_cubic-bezier(0.16,1,0.3,1)_0.1s_both]">
                      Miguel
                    </span>
                    <span className="block animate-[hero-rise_1s_cubic-bezier(0.16,1,0.3,1)_0.25s_both]">
                      Soro
                    </span>
                  </h1>
                </div>
                <div className="max-w-2xl">
                  <p className="text-xl md:text-2xl text-white/90 leading-relaxed mb-8 animate-[hero-rise_1s_cubic-bezier(0.16,1,0.3,1)_0.45s_both]">
                    Del pelotón profesional al lienzo. Arte ciclista con la
                    autenticidad de quien vivió el deporte desde dentro.
                  </p>
                  <div className="animate-[hero-rise_1s_cubic-bezier(0.16,1,0.3,1)_0.6s_both]">
                    <Link
                      href="/obra"
                      className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-medium hover:bg-gray-200 transition-colors uppercase tracking-wider text-sm"
                    >
                      <span>Ver colección</span>
                      <svg
                        className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
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
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden lg:block animate-[hero-rise_1s_cubic-bezier(0.16,1,0.3,1)_0.9s_both]">
              <div className="flex flex-col items-center gap-2 text-white/60">
                <span className="text-[10px] uppercase tracking-[0.3em]">
                  Scroll
                </span>
                <span className="h-10 w-px bg-white/40 animate-[scroll-hint_2s_ease-in-out_infinite]" />
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-24 lg:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-20">
              <Reveal>
                <SectionLabel prefix="01" paren>
                  El artista
                </SectionLabel>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-black mb-8 leading-tight text-balance">
                  La autenticidad de quien vivió el ciclismo desde dentro
                </h2>
              </Reveal>
              <Reveal delay={150} className="space-y-6">
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
                    className="group text-black hover:text-gray-600 transition-colors inline-flex items-center gap-2 font-medium"
                  >
                    <span>Leer biografía completa</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Technique Section */}
        <section className="py-24 lg:py-32 bg-black text-white -mx-6 lg:-mx-24 px-6 lg:px-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
              <Reveal>
                <SectionLabel prefix="02" paren onDark>
                  La técnica
                </SectionLabel>
                <h2 className="font-[family-name:var(--font-poster)] uppercase text-5xl md:text-6xl lg:text-7xl mb-8 leading-[0.85]">
                  Acrílico
                  <br />& <span className="text-accent">collage</span>
                </h2>
                <p className="text-lg md:text-xl text-white/70 leading-relaxed text-pretty">
                  Cada obra combina pintura acrílica con recortes de periódicos.
                  Los gestos atléticos se transforman en composiciones que
                  capturan la velocidad y emoción del pelotón profesional.
                </p>
              </Reveal>
              <Reveal delay={150} className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <Image
                  src="/process.webp"
                  alt="Proceso artístico de Miguel Soro"
                  fill
                  className="object-cover grayscale"
                />
              </Reveal>
            </div>
          </div>
        </section>

        {/* Featured Works Section */}
        <section className="py-24 lg:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <Reveal className="mb-16">
              <SectionLabel prefix="03" paren>
                La colección
              </SectionLabel>
              <h2 className="font-[family-name:var(--font-poster)] uppercase text-5xl md:text-6xl lg:text-7xl text-black mb-4 leading-none">
                Obras destacadas
              </h2>
              <div className="w-24 h-0.5 bg-accent"></div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200">
              {featuredPictures.slice(0, 6).map((picture, index) => (
                <Reveal key={picture.id} delay={(index % 3) * 120}>
                  <Link
                    href={`/pictures/${picture.slug}`}
                    className="group relative bg-white aspect-square overflow-hidden block"
                  >
                    <Image
                      src={picture.imageUrl}
                      alt={picture.title}
                      fill
                      className="object-cover grayscale transition-all duration-[600ms] ease-out group-hover:grayscale-0 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-[opacity,transform] duration-300">
                      <h3 className="text-white text-xl font-light">
                        {picture.title}
                      </h3>
                      <p className="text-gray-300 text-sm mt-1">
                        {picture.size}cm
                      </p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>

            <Reveal delay={150} className="mt-12 text-center">
              <Link
                href="/obra"
                className="inline-block px-10 py-4 bg-black text-white hover:bg-gray-800 transition-colors"
              >
                Ver colección completa
              </Link>
            </Reveal>
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
        totalPictures: allPictures.length,
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
        totalPictures: 0,
      },
      // On error, retry after 5 minutes
      revalidate: 300,
    };
  }
};
