import { Layout } from "@/components/Layout";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";

const news = [
  {
    date: "Enero 2025",
    title: "'L'Art del Ciclocross' en Benidorm",
    location: "Benidorm, España",
    body: "Del 8 al 17 de enero de 2025, Miguel Soro expone en el Espai d'Art del Ayuntamiento de Benidorm con motivo de la Copa del Mundo de Ciclocross UCI-Benidorm Costa Blanca 2025. Una muestra que combina el arte y el deporte en una de las competiciones más importantes del calendario internacional.",
  },
  {
    date: "Julio 2024",
    title: "Exposición en Bagnères de Luchon — Tour de Francia",
    location: "Bagnères de Luchon, Francia",
    body: "Durante las etapas pirenaicas del Tour de Francia 2024, Miguel Soro presentó una exposición en Bagnères de Luchon con obras que recorren desde el ciclismo clásico más épico de los años 30, 40 ó 50, al actual, capturando la esencia histórica del ciclismo.",
  },
  {
    date: "Mayo 2024",
    title: "Exposición en Destilerías Nardini — Giro de Italia",
    location: "Italia",
    body: "Con motivo del Giro de Italia 2024, Miguel Soro inauguró una exposición en la prestigiosa sala de las Destilerías Nardini en Italia, combinando su pasión por el arte y el ciclismo en el contexto de una de las tres Grandes Vueltas.",
  },
  {
    date: "Enero 2024",
    title: "'El Arte del Ciclismo' en Canals",
    location: "Canals, Valencia",
    body: "Miguel Soro inauguró su exposición 'El Arte del Ciclismo' en la Casa de la Cultura Ca Don José en Canals, con motivo de la Volta Ciclista a la Comunitat Valenciana. Un lugar especial donde hace 10 años lanzó una de sus primeras exposiciones dedicadas al ciclismo.",
  },
];

export default function NewsPage() {
  return (
    <Layout>
      <div className="py-16 lg:py-20">
        <Reveal className="mb-16">
          <SectionLabel prefix="Archivo">Exposiciones y medios</SectionLabel>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 leading-none tracking-tight">
            Noticias
          </h1>
          <div className="mt-6 h-1 w-16 bg-accent"></div>
        </Reveal>

        <div className="max-w-3xl divide-y divide-gray-200">
          {news.map((item, i) => (
            <Reveal
              key={item.title}
              delay={(i % 2) * 80}
              className="group grid md:grid-cols-[9rem_1fr] gap-4 md:gap-10 py-12 first:pt-0"
            >
              <div className="shrink-0">
                <span className="text-sm font-semibold uppercase tracking-wide text-gray-900">
                  {item.date}
                </span>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gray-400">
                  {item.location}
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-semibold leading-tight text-gray-900 mb-3 text-balance">
                  {item.title}
                </h2>
                <p className="text-gray-700 leading-relaxed text-pretty">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Video feature — RTVE */}
        <Reveal className="max-w-3xl mt-16">
          <video
            controls
            className="aspect-video h-auto w-full rounded-lg"
            poster="/images/video-thumbnail.jpg"
          >
            <source src="/videos/tve1.mp4" type="video/mp4" />
            <source src="/videos/tve1.ogg" type="video/ogg" />
            Your browser does not support the video tag.
          </video>
          <div className="flex items-center justify-between pt-4">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Exposición en RTVE — Telediario 1
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                Televisión Española
              </p>
            </div>
            <a
              className="text-xs font-medium text-gray-900 underline underline-offset-4 hover:text-gray-500"
              href="https://www.rtve.es/play/videos/telediario-1/exposicion-miguel-soro-pone-acento-espanol-homenaje-pau-vencedores-espanoles-del-tour/5377156/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver en RTVE Play →
            </a>
          </div>
        </Reveal>

        <Reveal className="max-w-3xl mt-16">
          <span className="inline-block text-sm uppercase tracking-[0.2em] text-gray-400">
            Más noticias próximamente
          </span>
        </Reveal>
      </div>
    </Layout>
  );
}
