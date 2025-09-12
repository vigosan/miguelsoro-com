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
        
        <div className="max-w-4xl mx-auto">
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
