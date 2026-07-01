import Image from "next/image";
import {
  BiographyPageLink,
  ContactPageLink,
  IndexPageLink,
  NewsPageLink,
  ObraPageLink,
  TermsPageLink,
} from "@/components/navigation/PageLinks";
import { cn } from "@/utils/cn";

const explore = [
  { name: "Obra", Link: ObraPageLink },
  { name: "Noticias", Link: NewsPageLink },
  { name: "Biografía", Link: BiographyPageLink },
  { name: "Contacto", Link: ContactPageLink },
];

export function Footer({ className }: { className?: string }) {
  const year = new Date().getFullYear();

  return (
    <footer className={cn("border-t border-gray-200 pt-12", className)}>
      <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <IndexPageLink className="inline-block">
            <span className="sr-only">Miguel Soro</span>
            <Image
              src="/signature.webp"
              alt="Firma de Miguel Soro"
              width={140}
              height={30}
              aria-hidden
              className="brightness-0"
            />
          </IndexPageLink>
          <p className="mt-5 text-sm leading-relaxed text-gray-500 text-pretty">
            Arte ciclista original. Del pelotón profesional al lienzo.
          </p>
        </div>

        <div className="flex gap-16">
          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
              Explorar
            </h3>
            <ul className="mt-4 space-y-2.5">
              {explore.map(({ name, Link }) => (
                <li key={name}>
                  <Link className="text-sm text-gray-600 transition-colors hover:text-gray-900">
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
              Contacto
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a
                  href="mailto:info@miguelsoro.com"
                  className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                >
                  info@miguelsoro.com
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/miguelsoro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                >
                  @miguelsoro
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-col-reverse items-center gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-between">
        <p className="text-xs text-gray-400">
          &copy; {year} Miguel Soro. Todos los derechos reservados.
        </p>
        <div className="flex gap-6">
          <TermsPageLink className="text-xs text-gray-400 transition-colors hover:text-gray-900">
            Términos
          </TermsPageLink>
        </div>
      </div>
    </footer>
  );
}
