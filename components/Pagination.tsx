import { ReactNode } from "react";

function Previous({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <button className={className}>{children}</button>;
}

function Next({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return <button className={className}>{children}</button>;
}

function Pagination({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

Pagination.Previous = Previous;
Pagination.Next = Next;

export { Pagination };
