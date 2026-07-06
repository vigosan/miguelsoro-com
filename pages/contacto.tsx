import Link from "next/link";
import { Layout } from "@/components/Layout";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import { LocalBusinessStructuredData } from "@/components/seo/StructuredData";
import Head from "next/head";

export default function ContactPage() {
  return (
    <>
      <LocalBusinessStructuredData />
      <Layout
        title="Contacto - Miguel Soro Art | Consultas y Adquisiciones"
        description="Contacta con Miguel Soro para consultas sobre adquisición de obras, exposiciones y colaboraciones. Galería de arte ciclístico con presencia internacional. Respuesta en menos de 24 horas."
        url="https://www.miguelsoro.com/contacto"
      >
        <div className="py-20 lg:py-24">
          <Reveal className="mb-20">
            <SectionLabel prefix="Contacto">Estudio</SectionLabel>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 leading-none tracking-tight">
              Hablemos de <span className="text-accent-ink">arte</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg text-gray-600 leading-relaxed text-pretty">
              ¿Preguntas sobre una obra, una exposición o una colaboración?
              Escribe directamente al estudio.
            </p>
          </Reveal>

          <div className="grid gap-12 md:grid-cols-2 max-w-4xl">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-4">
                Escríbenos
              </p>
              <a
                href="mailto:info@miguelsoro.com"
                className="text-xl md:text-2xl font-medium text-gray-900 hover:text-gray-500 transition-colors"
              >
                info@miguelsoro.com
              </a>
              <p className="text-sm text-gray-500 mt-3">
                Consultas generales, adquisiciones y exposiciones.
              </p>
            </Reveal>

            <Reveal delay={120}>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-4">
                Síguelo
              </p>
              <a
                href="https://www.instagram.com/miguelsoro/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl md:text-2xl font-medium text-gray-900 hover:text-gray-500 transition-colors"
              >
                @miguelsoro
              </a>
              <p className="text-sm text-gray-500 mt-3">
                El estudio y las obras en Instagram.
              </p>
            </Reveal>
          </div>

          <Reveal className="mt-20 border-t border-gray-200 pt-16 max-w-4xl">
            <SectionLabel prefix="02" paren className="mb-8">
              Colaboraciones
            </SectionLabel>
            <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-end">
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 leading-tight text-balance">
                Galerías, eventos ciclistas y pintura en directo.
              </h2>
              <div>
                <p className="text-gray-600 leading-relaxed text-pretty">
                  Si organizas una exposición o buscas artista para pintar en
                  directo durante competiciones, cuéntame tu propuesta.
                </p>
                <p className="mt-4 text-sm font-medium text-gray-900">
                  Respuesta en menos de 24 horas.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </Layout>
    </>
  );
}
