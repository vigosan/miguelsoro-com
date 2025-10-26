import { GetStaticProps } from "next";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Layout } from "@/components/Layout";
import { PaintStrokes } from "@/components/PaintStrokes";
import { WebsiteStructuredData } from "@/components/seo/StructuredData";
import { DatabasePictureRepository } from "@/infra/DatabasePictureRepository";
import { Picture } from "@/domain/picture";

interface IndexPageProps {
  featuredPictures: Picture[];
}

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

export default function IndexPage({ featuredPictures }: IndexPageProps) {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <>
      <WebsiteStructuredData />
      <PaintStrokes />
      <Layout
        title="Miguel Soro - Arte Ciclístico Original | Ex-Ciclista Profesional Reconocido por Forbes"
        description="Descubre la colección única de Miguel Soro: centenares de obras de leyendas del ciclismo. Ex-profesional (1998-2003) con exposiciones internacionales en 6 países. Técnicas mixtas acrílico y collage. Reconocido por Forbes y Giant Bicycles."
        url="https://www.miguelsoro.com"
      >
      {/* Hero Section - Minimalist */}
      <section className="relative min-h-screen bg-white -mx-6 lg:-mx-24 overflow-hidden">
        {/* Background Image - Fixed */}
        <motion.div
          className="fixed inset-0 w-full h-screen"
          style={{ opacity: heroOpacity }}
        >
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <Image
            src="/estudio.webp"
            alt="Miguel Soro en su estudio"
            fill
            className="object-cover grayscale"
            priority
          />
        </motion.div>

        {/* Content - Scrolls over background */}
        <div className="relative z-20 min-h-screen flex items-center">
          <motion.div
            className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-20"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="max-w-4xl">
              <motion.h1
                className="text-[clamp(4rem,20vw,18rem)] font-light text-white leading-[0.9] tracking-tighter mb-12"
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              >
                Miguel<br />Soro
              </motion.h1>

              <motion.div
                className="space-y-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <p className="text-2xl md:text-3xl text-white max-w-2xl leading-relaxed font-light">
                  Del pelotón profesional al lienzo.
                </p>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  <Link
                    href="/obra"
                    className="inline-flex items-center gap-3 text-xl text-white border-b-2 border-white hover:border-gray-300 transition-colors duration-200 pb-1"
                  >
                    <span>Ver obra</span>
                    <span>→</span>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <div className="flex flex-col items-center gap-3 text-white/60">
            <span className="text-xs uppercase tracking-[0.2em]">Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* About Section - Minimalist */}
      <section id="about" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-20">

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <h2 className="text-5xl md:text-6xl font-light text-black mb-12 leading-tight">
                La autenticidad de quien vivió el ciclismo desde dentro
              </h2>
            </motion.div>

            <motion.div
              className="space-y-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.p
                className="text-lg text-gray-700 leading-relaxed"
                variants={staggerItem}
              >
                Miguel Soro corrió profesionalmente durante cinco años (1998-2003) con equipos
                portugueses e italianos, participó en el Mundial Junior de Ecuador y ganó etapas
                en el Circuito Montañés.
              </motion.p>
              <motion.p
                className="text-lg text-gray-700 leading-relaxed"
                variants={staggerItem}
              >
                Como artista autodidacta, desarrolló una técnica única de acrílico y collage que
                captura la velocidad, la estrategia y la emoción del pelotón.
              </motion.p>
              <motion.div className="pt-8" variants={staggerItem}>
                <Link
                  href="/biografia"
                  className="text-black hover:text-gray-600 transition-colors duration-200 inline-flex items-center gap-2"
                >
                  <span>Leer biografía completa</span>
                  <span>→</span>
                </Link>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>


      {/* Technique Section - Minimalist */}
      <section className="py-32 bg-black text-white -mx-6 lg:-mx-24 px-6 lg:px-24 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <h2 className="text-6xl md:text-7xl font-light mb-8 leading-none">
                Acrílico &<br />Collage
              </h2>
              <motion.div
                className="w-24 h-px bg-white mb-12"
                initial={{ width: 0 }}
                whileInView={{ width: 96 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              ></motion.div>
              <p className="text-xl text-gray-300 leading-relaxed">
                Cada obra combina pintura acrílica con recortes de periódicos. Los gestos
                atléticos se transforman en composiciones que capturan la velocidad y
                emoción del pelotón profesional.
              </p>
            </motion.div>

            <motion.div
              className="relative aspect-[4/3]"
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src="/process.webp"
                alt="Proceso artístico de Miguel Soro"
                fill
                className="object-cover grayscale"
              />
            </motion.div>

          </div>
        </div>
      </section>

      {/* Featured Works Section - Minimalist Grid */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">

          <motion.div
            className="mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h2 className="text-6xl md:text-7xl font-light text-black mb-4">Obras destacadas</h2>
            <motion.div
              className="w-24 h-px bg-black"
              initial={{ width: 0 }}
              whileInView={{ width: 96 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            ></motion.div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {featuredPictures.slice(0, 6).map((picture) => (
              <motion.div key={picture.id} variants={staggerItem}>
                <Link
                  href={`/pictures/${picture.slug}`}
                  className="group relative bg-white aspect-square overflow-hidden block"
                >
                  <Image
                    src={picture.imageUrl}
                    alt={picture.title}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-white text-xl font-light">{picture.title}</h3>
                    <p className="text-gray-300 text-sm mt-1">{picture.size}cm</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link
              href="/obra"
              className="inline-block px-10 py-4 bg-black text-white hover:bg-gray-800 transition-colors duration-200"
            >
              Ver colección completa
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Call to Action Final - Minimalist */}
      <section className="py-32 bg-black text-white -mx-6 lg:-mx-24 px-6 lg:px-24">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2
            className="text-5xl md:text-6xl font-light mb-8 leading-tight"
            variants={staggerItem}
          >
            Descubre la colección completa
          </motion.h2>
          <motion.p
            className="text-xl text-gray-400 mb-16 max-w-2xl mx-auto"
            variants={staggerItem}
          >
            Cada obra captura la esencia del pelotón profesional con autenticidad única.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={staggerItem}
          >
            <Link
              href="/obra"
              className="px-10 py-4 bg-white text-black hover:bg-gray-200 transition-colors duration-200"
            >
              Ver colección
            </Link>
            <Link
              href="/contacto"
              className="px-10 py-4 border border-white text-white hover:bg-white hover:text-black transition-colors duration-200"
            >
              Contacto
            </Link>
          </motion.div>
        </motion.div>
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
