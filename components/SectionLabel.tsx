import { cn } from "@/utils/cn";

type Props = {
  prefix: string;
  children: React.ReactNode;
  paren?: boolean;
  onDark?: boolean;
  className?: string;
};

export function SectionLabel({
  prefix,
  children,
  paren = false,
  onDark = false,
  className,
}: Props) {
  return (
    <p
      className={cn(
        "text-xs uppercase tracking-[0.3em] mb-6",
        onDark ? "text-white/40" : "text-gray-400",
        className,
      )}
    >
      {paren ? (
        <>
          (<span className={onDark ? "text-accent" : "text-accent-ink"}>{prefix}</span>){" "}
        </>
      ) : (
        <span className={onDark ? "text-accent" : "text-accent-ink"}>{prefix}</span>
      )}
      {" — "}
      {children}
    </p>
  );
}
