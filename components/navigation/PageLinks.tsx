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
    <Link href="/biography" className={className}>
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
    <Link href="/contact" className={className}>
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
    <Link href="/news" className={className}>
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