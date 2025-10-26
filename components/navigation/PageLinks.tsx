import Link from "next/link";

export function IndexPageLink({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href="/" className={className}>
      {children}
    </Link>
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
    <Link href="/biografia" className={className}>
      {children}
    </Link>
  );
}

export function ContactPageLink({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href="/contacto" className={className}>
      {children}
    </Link>
  );
}

export function NewsPageLink({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href="/noticias" className={className}>
      {children}
    </Link>
  );
}

export function ObraPageLink({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href="/obra" className={className}>
      {children}
    </Link>
  );
}

export function TermsPageLink({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href="/terms" className={className}>
      {children}
    </Link>
  );
}
