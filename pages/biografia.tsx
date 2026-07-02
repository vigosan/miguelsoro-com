import Image from "next/image";
import { Layout } from "@/components/Layout";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import Head from "next/head";

export default function BiographyPage() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://www.miguelsoro.com#artist",
    name: "Miguel Soro",
    birthDate: "1976-02-27",
    birthPlace: {
      "@type": "Place",
      name: "Xàtiva, Valencia, España",
    },
    nationality: "Spanish",
    jobTitle: ["Artista Visual", "Ex-Ciclista Profesional"],
    description:
      "Ex-ciclista profesional español reconvertido en artista contemporáneo especializado en arte ciclístico. Ha expuesto en España, Italia, Francia, Estados Unidos, Canadá y Australia.",
    url: "https://www.miguelsoro.com",
    image: "https://www.miguelsoro.com/biography.webp",
    sameAs: ["https://www.miguelsoro.com"],
    hasOccupation: [
      {
        "@type": "Occupation",
        name: "Visual Artist",
        description:
          "Contemporary artist specializing in cycling-themed artwork using acrylic and collage techniques",
      },
      {
        "@type": "Occupation",
        name: "Professional Cyclist",
        description:
          "Former professional cyclist who competed in Portugal and Italy",
      },
    ],
    knowsAbout: [
      "Ciclismo profesional",
      "Arte contemporáneo",
      "Pintura acrílica",
      "Técnicas de collage",
      "Arte deportivo",
    ],
    award: [
      "Reconocimiento de Forbes",
      "Apoyo de Giant Bicycles",
      "Exposiciones internacionales",
    ],
    workLocation: {
      "@type": "Place",
      name: "Valencia, España",
    },
    alumni: "Ciclismo profesional",
  };

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personSchema),
          }}
        />
      </Head>
      <Layout
        title="Biografía Miguel Soro - Ex-Ciclista Profesional y Artista | Del Pedal al Pincel"
        description="Conoce la historia de Miguel Soro (Xàtiva, 1976), ex-ciclista profesional convertido en artista reconocido internacionalmente. Exposiciones en España, Italia, Francia, EEUU, Canadá y Australia. Reconocido por Forbes y Giant Bicycles."
        url="https://www.miguelsoro.com/biography"
      >
        <div className="py-16 lg:py-20">
          <Reveal className="mb-12">
            <SectionLabel prefix="Xàtiva, 1976">Perfil</SectionLabel>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 leading-[1.05] tracking-tight text-balance">
              Del pelotón al <span className="text-accent-ink">lienzo</span>
            </h1>
          </Reveal>

          <Reveal className="mb-20">
            <div className="aspect-[2/1] relative overflow-hidden rounded-lg">
              <Image
                src="/biography.webp"
                alt="Miguel Soro en su estudio"
                className="h-full w-full object-cover object-center grayscale"
                width={948}
                height={465}
                priority
              />
            </div>
          </Reveal>

          <div className="max-w-2xl space-y-16">
            {[
              {
                n: "01",
                title: "Los inicios",
                body: "Nacido el 27 de febrero de 1976 en Xàtiva, Miguel Soro es un exciclista profesional, conocido por su talento sobre la bicicleta desde su infancia. Compitió desde categorías de base hasta convertirse en profesional en Portugal e Italia.",
              },
              {
                n: "02",
                title: "La transición al arte",
                body: "Reconocido por una obra pictórica que fusiona su amor por la bicicleta y el arte, migró su espíritu competitivo al lienzo. Ha exhibido en España, Italia, Francia, Estados Unidos, Canadá y Australia.",
              },
              {
                n: "03",
                title: "Reconocimiento internacional",
                body: "Su trayectoria incluye exposiciones en museos, eventos de ciclismo vintage y galerías internacionales. Con su pincel ilustra la épica, la emoción y el esfuerzo del ciclismo.",
              },
              {
                n: "04",
                title: "Apoyo y prestigio",
                body: "Su obra ha contado con el apoyo de entidades consolidadas del deporte, como Giant, y ha sido resaltada por revistas como Forbes.",
              },
            ].map((section, i) => (
              <Reveal
                key={section.n}
                delay={i * 60}
                className="grid grid-cols-[auto_1fr] gap-6 md:gap-10"
              >
                <span className="text-2xl md:text-3xl font-light text-accent leading-none pt-1 tabular-nums">
                  {section.n}
                </span>
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
                    {section.title}
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg text-pretty">
                    {section.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="max-w-2xl mt-20 border-t border-gray-200 pt-12">
            <p className="text-2xl md:text-3xl font-light text-gray-900 leading-snug text-balance italic">
              &ldquo;Bienvenidos a este viaje a través del arte y el
              deporte.&rdquo;
            </p>
            <p className="mt-6 text-sm uppercase tracking-[0.25em] text-gray-400">
              Miguel Soro
            </p>
          </Reveal>
        </div>
      </Layout>
    </>
  );
}
