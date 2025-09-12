import Link from "next/link";
import { Layout } from "@/components/Layout";

export default function NewsPage() {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Noticias
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Mantente al día con las últimas exposiciones, eventos y apariciones en medios. 
            Descubre el impacto del arte ciclista en la comunidad.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Exposición Copa del Mundo de Ciclocross 2025 - Benidorm */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    'L'Art del Ciclocross' en Benidorm
                  </h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-3">
                    Enero 2025
                  </span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Del 8 al 17 de enero de 2025, Miguel Soro expone en el Espai d'Art del Ayuntamiento de Benidorm 
                con motivo de la Copa del Mundo de Ciclocross UCI-Benidorm Costa Blanca 2025. Una muestra 
                que combina el arte y el deporte en una de las competiciones más importantes del calendario internacional.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Benidorm, España
              </div>
            </div>
          </div>

          {/* Tour de Francia en Pirineos 2024 */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Exposición en Bagnères de Luchon - Tour de Francia
                  </h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-3">
                    Julio 2024
                  </span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Durante las etapas pirenaicas del Tour de Francia 2024, Miguel Soro presentó una exposición 
                en Bagnères de Luchon con obras que recorren "desde el ciclismo clásico más épico de los años 
                30, 40 ó 50, al actual", capturando la esencia histórica del ciclismo.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Bagnères de Luchon, Francia
              </div>
            </div>
          </div>

          {/* Giro de Italia 2024 - Destilerías Nardini */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Exposición en Destilerías Nardini - Giro de Italia
                  </h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800 mb-3">
                    Mayo 2024
                  </span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Con motivo del Giro de Italia 2024, Miguel Soro inauguró una exposición en la prestigiosa 
                sala de las Destilerías Nardini en Italia, combinando su pasión por el arte y el ciclismo 
                en el contexto de una de las tres Grandes Vueltas.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Italia
              </div>
            </div>
          </div>

          {/* Exposición en Canals 2024 */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    "El Arte del Ciclismo" en Canals
                  </h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mb-3">
                    Enero 2024
                  </span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Miguel Soro inauguró su exposición "El Arte del Ciclismo" en la Casa de la Cultura Ca Don José 
                en Canals, con motivo de la Volta Ciclista a la Comunitat Valenciana. Un lugar especial donde 
                hace 10 años lanzó una de sus primeras exposiciones dedicadas al ciclismo.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Canals, Valencia
              </div>
            </div>
          </div>

          {/* Video RTVE existente */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Exposición en RTVE - Telediario 1
              </h2>
              <p className="text-gray-600">
                Reportaje sobre la exposición de Miguel Soro que pone el acento español 
                en el homenaje a los vencedores españoles del Tour de Francia.
              </p>
            </div>
            <div className="p-6">
              <video 
                controls 
                className="aspect-video h-auto w-full rounded-lg shadow-sm"
                poster="/images/video-thumbnail.jpg"
              >
                <source src="/videos/tve1.mp4" type="video/mp4" />
                <source src="/videos/tve1.ogg" type="video/ogg" />
                Your browser does not support the video tag.
              </video>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">Televisión Española</span>
                <a
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  href="https://www.rtve.es/play/videos/telediario-1/exposicion-miguel-soro-pone-acento-espanol-homenaje-pau-vencedores-espanoles-del-tour/5377156/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver en RTVE Play →
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-700">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Más noticias próximamente
          </div>
        </div>
      </div>
    </Layout>
  );
}
