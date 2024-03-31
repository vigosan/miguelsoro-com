import Layout from "@/components/Layout";
import Image from "next/image";

export default function AboutPage() {
  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <Image
          src="/ms.jpg"
          alt="Miguel Soro"
          className="h-full w-full object-cover object-center"
          width={948}
          height={465}
        />
        <p>
          Nacido el 27 de febrero de 1976 en Xàtiva, Miguel Soro es un
          exciclista profesional, conocido por su talento en las bicicletas
          desde su infancia. Compitió activamente en múltiples etapas del
          ciclismo desde principiante hasta convertirse en un profesional
          destacado en Portugal e Italia.
        </p>
        <p>
          Además de su notable carrera deportiva, Miguel es ampliamente
          reconocido por su impactante obra pictórica que fusiona su amor por la
          bicicleta y el arte. Migrando su espíritu competitivo al arte, ha
          exhibido su obra en todo el mundo, desde España hasta Italia, Francia,
          Estados Unidos, Canadá y Australia.
        </p>
        <p>
          Su extensa trayectoria incluye exposiciones en museos, eventos de
          ciclismo vintage y galerías internacionales, recibiendo el
          reconocimiento del público y los críticos. Con su pincel, ilustra la
          épica, la emoción y el esfuerzo requeridos en el deporte del ciclismo,
          retratando a los grandes héroes de este deporte y evocando momentos
          célebres de la historia del ciclismo.
        </p>
        <p>
          La pasión de Miguel por el ciclismo va más allá de las ruedas y los
          pedales y se ha convertido en su tema artístico principal. Siendo
          reconocido tanto por su trayectoria en el ciclismo como en el arte, su
          obra ha contado con el apoyo de entidades consolidadas en el deporte,
          como la empresa Giant, y ha sido resaltada por prestigiosas revistas
          como Forbes.
        </p>
        <p>
          Ahora, en esta etapa de su vida artística, Miguel Soro se enfrenta a
          nuevos retos. Con un futuro prometedor en el horizonte, avanza hacia
          nuevos proyectos y exposiciones, con el establecimiento de un amplio
          estudio de arte y el homenaje a destacadas figuras del ciclismo
          mediante su pintura.
        </p>
        <p>Bienvenidos en este viaje a través del arte y el deporte.</p>
      </div>
    </Layout>
  );
}
