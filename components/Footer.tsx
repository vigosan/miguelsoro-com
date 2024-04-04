import { cn } from "@/utils/cn";

const navigation = [
  { name: "Contacto", href: "/contact" },
  { name: "Términos", href: "/terms" },
];

export function Footer({ className }: { className?: string }) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "flex items-center flex-col lg:flex-row lg:justify-between flex-col-reverse",
        className,
      )}
    >
      <div>
        <p className="text-center text-xs leading-6 text-gray-500 lg:text-right">
          &copy; {year} Miguel Soro. Todos los derechos reservados.
        </p>
      </div>
      <div className="flex gap-4">
        {navigation.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="text-sm leading-6 text-gray-600 hover:text-gray-899"
          >
            {item.name}
          </a>
        ))}
      </div>
    </footer>
  );
}
