import { Fragment } from "react";
import {
  ContactPageLink,
  TermsPageLink,
} from "@/components/navigation/PageLinks";
import { cn } from "@/utils/cn";

const navigation = [
  { name: "Contacto", Link: ContactPageLink },
  { name: "Términos", Link: TermsPageLink },
];

export function Footer({ className }: { className?: string }) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "flex flex-col flex-col-reverse items-center lg:flex-row lg:justify-between",
        className,
      )}
    >
      <div>
        <p className="text-center text-xs leading-6 text-gray-500 lg:text-right">
          &copy; {year} Miguel Soro. Todos los derechos reservados.
        </p>
      </div>
      <div className="flex gap-4">
        {navigation.map(({ name, Link }, i) => (
          <Fragment key={name}>
            {i > 0 && <span className="text-gray-600">&bull;</span>}
            <Link className="hover:text-gray-899 text-sm leading-6 text-gray-600">
              {name}
            </Link>
          </Fragment>
        ))}
      </div>
    </footer>
  );
}
