import { GetStaticProps } from "next";
import Link from "next/link";
import Image from "next/image";
import { Layout } from "@/components/Layout";
import { Item } from "@/components/Item";
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
        title="Miguel Soro - Arte Ciclístico Original | Ex-Ciclista Profesional"
        description="Descubre la colección única de arte ciclístico de Miguel Soro, ex-ciclista profesional español. Obras originales en acrílico y collage inspiradas en el mundo del ciclismo. Compra arte deportivo contemporáneo."
        url="https://www.miguelsoro.com"
      >
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] max-h-[600px] flex items-center justify-center overflow-hidden -mx-6 lg:mx-0">
        {/* Background Image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/estudio.webp')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center 40%",
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/25" />

        {/* Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6 lg:px-4">
          <h1 className="text-5xl md:text-7xl font-light mb-6 tracking-wide">
            Miguel Soro
          </h1>
          <p className="text-xl md:text-2xl font-light mb-4 opacity-90">
            Arte Ciclístico Original
          </p>
          <p className="text-lg md:text-xl mb-8 opacity-80 max-w-2xl mx-auto leading-relaxed">
            Ex-ciclista profesional que transforma la pasión por el deporte en arte contemporáneo
          </p>
          <button
            onClick={() => {
              document.getElementById('about')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              });
            }}
            className="inline-block px-8 py-3 border border-white/30 text-white hover:bg-white hover:text-gray-900 transition-all duration-300 text-sm font-medium tracking-wider uppercase"
          >
            Conocer más
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60">
          <div className="animate-bounce">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Del pedal al pincel
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Miguel Soro es un ex-ciclista profesional español que ha encontrado en el arte
                una nueva forma de expresar su pasión por el deporte que marcó su vida.
              </p>
              <p>
                Sus obras capturan la esencia del ciclismo: la velocidad, la estrategia,
                la emoción y la belleza estética de este deporte a través de técnicas mixtas
                que combinan acrílico y collage.
              </p>
              <p>
                Cada pieza es única y refleja momentos icónicos del ciclismo profesional,
                desde las grandes vueltas hasta los sprints más emocionantes.
              </p>
            </div>
            <Link
              href="/biografia"
              className="inline-block mt-6 px-6 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-colors duration-300 text-sm font-medium tracking-wider uppercase"
            >
              Leer biografía completa
            </Link>
          </div>
          <div className="relative">
            <Image
              src="/signature.webp"
              alt="Miguel Soro en su estudio"
              width={500}
              height={400}
              className="rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Journey Timeline Section */}
      <section className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Un viaje de transformación
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Del pelotón profesional al estudio de arte: descubre cómo las experiencias sobre dos ruedas
            se transformaron en una nueva forma de expresión artística.
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-0.5 w-0.5 h-full bg-gradient-to-b from-blue-500 via-purple-500 to-orange-500"></div>

          <div className="space-y-16">
            {/* Timeline item 1 */}
            <div className="flex items-center">
              <div className="flex-1 text-right pr-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ciclista profesional</h3>
                <p className="text-gray-600">Años de competición, victorias y derrotas que forjaron su carácter y le dieron una perspectiva única del deporte.</p>
              </div>
              <div className="w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-lg z-10 relative"></div>
              <div className="flex-1 pl-8"></div>
            </div>

            {/* Timeline item 2 */}
            <div className="flex items-center">
              <div className="flex-1 pr-8"></div>
              <div className="w-4 h-4 bg-purple-500 rounded-full border-4 border-white shadow-lg z-10 relative"></div>
              <div className="flex-1 text-left pl-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">El despertar artístico</h3>
                <p className="text-gray-600">El descubrimiento del arte como nueva forma de canalizar la pasión y las emociones vividas en el ciclismo.</p>
              </div>
            </div>

            {/* Timeline item 3 */}
            <div className="flex items-center">
              <div className="flex-1 text-right pr-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Primeras obras</h3>
                <p className="text-gray-600">Experimentación con técnicas mixtas para capturar la velocidad y emoción del ciclismo profesional.</p>
              </div>
              <div className="w-4 h-4 bg-orange-500 rounded-full border-4 border-white shadow-lg z-10 relative"></div>
              <div className="flex-1 pl-8"></div>
            </div>

            {/* Timeline item 4 */}
            <div className="flex items-center">
              <div className="flex-1 pr-8"></div>
              <div className="w-4 h-4 bg-green-500 rounded-full border-4 border-white shadow-lg z-10 relative"></div>
              <div className="flex-1 text-left pl-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Artista consolidado</h3>
                <p className="text-gray-600">Hoy, Miguel Soro es reconocido por su estilo único que fusiona deporte y arte de manera magistral.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Immersive Quote Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 -mx-6 px-6 lg:-mx-24 lg:px-24 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 Q25,20 50,50 T100,50 L100,100 L0,100 Z" fill="currentColor"/>
          </svg>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <svg className="w-16 h-16 text-blue-500 mx-auto mb-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z"/>
          </svg>

          <blockquote className="text-2xl md:text-3xl font-light text-gray-800 leading-relaxed mb-8 italic">
            "No quiero ser el pintor del deporte,
            quiero ser el pintor del ciclismo."
          </blockquote>

          <div className="flex items-center justify-center space-x-4">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-blue-500"></div>
            <span className="text-lg font-medium text-gray-700">Miguel Soro</span>
            <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-blue-500"></div>
          </div>
        </div>
      </section>

      {/* Featured Works Section */}
      <section className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Obras destacadas
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Cada pieza cuenta una historia única del mundo del ciclismo.
            Descubre momentos icónicos transformados en arte contemporáneo.
          </p>
        </div>

        {/* Carousel-style featured works */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
            {featuredPictures.slice(0, 3).map((picture, index) => (
              <div key={picture.id} className="group">
                <Link href={`/pictures/${picture.slug}`}>
                  <div className="relative">
                    {/* Main image */}
                    <div className="aspect-square relative bg-gray-900 p-4 rounded-lg overflow-hidden">
                      <Image
                        src={picture.imageUrl}
                        alt={picture.title}
                        className="h-full w-full object-cover rounded transition-all duration-500 group-hover:scale-110"
                        width={400}
                        height={400}
                      />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded"></div>

                      {/* Content overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="font-semibold text-lg mb-2">{picture.title}</h3>
                        <p className="text-sm opacity-90">{picture.size}cm • {picture.productTypeName}</p>
                        {picture.stock > 0 && (
                          <div className="mt-3">
                            <span className="inline-block px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                              Disponible
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <Link
            href="/obra"
            className="group relative inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white font-semibold rounded-full hover:from-gray-800 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
          >
            <span>Explorar toda la colección</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Call to Action Final */}
      <section className="py-16 text-white -mx-6 px-6 lg:-mx-24 lg:px-24 relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/process.webp')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        />

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/60"></div>

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para vivir el arte ciclístico?
          </h2>
          <p className="text-lg opacity-90 mb-8 leading-relaxed">
            Sumérgete en un mundo donde cada pedal se convierte en pincelada
            y cada victoria en una obra maestra. Descubre la colección completa
            y encuentra la pieza que hable a tu pasión por el ciclismo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/obra"
              className="group relative px-8 py-3 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              <span className="relative z-10">Explorar colección</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </Link>

            <Link
              href="/biografia"
              className="group px-8 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105"
            >
              Conocer al artista
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
    console.error('Error fetching data for homepage:', error);

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
