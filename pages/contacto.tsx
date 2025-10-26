import Link from "next/link";
import { Layout } from "@/components/Layout";
import { LocalBusinessStructuredData } from "@/components/seo/StructuredData";
import Head from "next/head";

export default function ContactPage() {
  return (
    <>
      <LocalBusinessStructuredData />
      <Layout
        title="Contacto - Miguel Soro Art | Consultas y Adquisiciones"
        description="Contacta con Miguel Soro para consultas sobre adquisición de obras, exposiciones y colaboraciones. Galería de arte ciclístico con presencia internacional. Respuesta en menos de 24 horas."
        url="https://www.miguelsoro.com/contact"
      >
        <div className="py-20">
          <div className="text-center mb-20">
            <h1 className="text-4xl font-light text-gray-900 mb-6">Contacto</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              ¿Tienes preguntas sobre la obra de Miguel Soro o te gustaría más
              información sobre futuras exposiciones? Nos encantaría escucharte.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-20">
            <div className="grid gap-16 lg:grid-cols-2">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Email
                </h3>
                <p className="text-gray-600 mb-6">Escríbenos directamente</p>
                <a
                  className="inline-flex items-center text-lg font-medium text-gray-900 hover:text-gray-600 transition-colors group"
                  href="mailto:info@miguelsoro.com"
                >
                  info@miguelsoro.com
                  <svg
                    className="ml-2 h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
                <p className="text-sm text-gray-500 mt-2">
                  Consultas generales, adquisiciones y exposiciones
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Redes Sociales
                </h3>
                <p className="text-gray-600 mb-6">
                  Síguenos para más novedades
                </p>
                <div>
                  <a
                    className="inline-flex items-center text-lg font-medium text-gray-900 hover:text-gray-600 transition-colors group"
                    href="https://www.instagram.com/miguelsoro/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    @miguelsoro
                    <svg
                      className="ml-2 h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                  <p className="text-sm text-gray-500 mt-1">Instagram</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-20">
              <div className="text-center max-w-xl mx-auto">
                <h3 className="text-2xl font-light text-gray-900 mb-6">
                  ¿Interesado en colaborar?
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Si representas una galería de arte, organizas eventos
                  ciclistas, o buscas artista para pintura en directo durante
                  competiciones, nos encantaría conocer tu propuesta.
                </p>
                <p className="text-sm text-gray-500">
                  Respuesta en menos de 24 horas
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
