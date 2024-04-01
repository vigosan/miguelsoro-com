export function Footer({ className }: { className?: string }) {
  const year = new Date().getFullYear();

  return (
    <footer className={className}>
      <p className="text-sm leading-6 text-gray-900 text-center lg:text-right">
        &copy; {year} Miguel Soro. Todos los derechos reservados.
      </p>
    </footer>
  );
}
