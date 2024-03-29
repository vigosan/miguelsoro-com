import Layout from "@/components/Layout";
import Image from "next/image";

export default function AboutPage() {
  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <Image
          src="/about.jpg"
          alt="Miguel Soro"
          className="h-full w-full object-cover object-center"
          width={948}
          height={465}
        />
        <p>
          Miguel Soro es un artista autodidacta y cauteloso, que decidió
          combinar su carrera en el ciclismo con su carrera en la pintura. A lo
          largo de su trayectoria, ha creado un gran número de obras que
          reflejan su amor y pasión por el mundo del ciclismo.
        </p>
        <p>
          Con su técnica de medios mixtos, Soro ha capturado momentos icónicos
          del ciclismo y del paisaje que rodea el deporte, siendo muy admirado
          por los entusiastas de la historia del ciclismo. También ha creado
          impresiones de litografía, como la del famoso ciclista Fiorenzo Magni.
        </p>
      </div>
    </Layout>
  );
}
