export function Footer({ className }: { className?: string }) {
  const year = new Date().getFullYear();

  return (
    <footer className={className}>
      <p className="text-center text-sm leading-6 text-gray-900 lg:text-right">
        &copy; {year} Miguel Soro. Todos los derechos reservados.
      </p>
    </footer>
  );
}
