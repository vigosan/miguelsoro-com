import Link from "next/link";
import Image from "next/image";
import { Layout } from "@/components/Layout";

export default function BiographyPage() {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Biografía
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            La historia de un ciclista profesional que encontró en el arte su nueva pasión. 
            Descubre el viaje de Miguel Soro desde el pedal hasta el pincel.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
            <div className="aspect-[2/1] relative">
              <Image
                src="/biography.webp"
                alt="Miguel Soro"
                className="h-full w-full object-cover object-center"
                width={948}
                height={465}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid gap-8 lg:grid-cols-2">
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-2 h-8 bg-blue-600 rounded-full mr-4"></div>
              <h2 className="text-xl font-semibold text-gray-900">Los Inicios</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Nacido el 27 de febrero de 1976 en Xàtiva, Miguel Soro es un
              exciclista profesional, conocido por su talento en las bicicletas
              desde su infancia. Compitió activamente en múltiples etapas del
              ciclismo desde principiante hasta convertirse en un profesional
              destacado en Portugal e Italia.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-2 h-8 bg-green-600 rounded-full mr-4"></div>
              <h2 className="text-xl font-semibold text-gray-900">La Transición al Arte</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Además de su notable carrera deportiva, Miguel es ampliamente
              reconocido por su impactante obra pictórica que fusiona su amor por la
              bicicleta y el arte. Migrando su espíritu competitivo al arte, ha
              exhibido su obra en todo el mundo, desde España hasta Italia, Francia,
              Estados Unidos, Canadá y Australia.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-2 h-8 bg-yellow-600 rounded-full mr-4"></div>
              <h2 className="text-xl font-semibold text-gray-900">Reconocimiento Internacional</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Su extensa trayectoria incluye exposiciones en museos, eventos de
              ciclismo vintage y galerías internacionales, recibiendo el
              reconocimiento del público y los críticos. Con su pincel, ilustra la
              épica, la emoción y el esfuerzo requeridos en el deporte del ciclismo.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-2 h-8 bg-red-600 rounded-full mr-4"></div>
              <h2 className="text-xl font-semibold text-gray-900">Apoyo y Prestigio</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Siendo reconocido tanto por su trayectoria en el ciclismo como en el arte, su
              obra ha contado con el apoyo de entidades consolidadas en el deporte,
              como la empresa Giant, y ha sido resaltada por prestigiosas revistas
              como Forbes.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-600 mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">El Futuro</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ahora, en esta etapa de su vida artística, Miguel Soro se enfrenta a
              nuevos retos. Con un futuro prometedor en el horizonte, avanza hacia
              nuevos proyectos y exposiciones, con el establecimiento de un amplio
              estudio de arte y el homenaje a destacadas figuras del ciclismo
              mediante su pintura.
            </p>
            <p className="text-lg font-medium text-gray-900 italic">
              &ldquo;Bienvenidos en este viaje a través del arte y el deporte.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export function BiographyPageLink({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href="/biography" className={className}>
      {children}
    </Link>
  );
}
