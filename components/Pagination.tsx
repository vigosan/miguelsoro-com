import { ReactNode } from "react";

function Previous({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <button className={className} data-testid="pagination-previous">{children}</button>;
}

function Next({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return <button className={className} data-testid="pagination-next">{children}</button>;
}

function Pagination({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className} data-testid="pagination-container">{children}</div>;
}

Pagination.Previous = Previous;
Pagination.Next = Next;

export { Pagination };
