import type { ElementType, ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";

type Props = {
  lines: ReactNode[];
  className?: string;
  as?: ElementType;
};

export function LineReveal({ lines, className = "", as }: Props) {
  const { ref, visible } = useReveal<HTMLHeadingElement>();
  const Tag = as ?? "h2";

  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <span
            className="block translate-y-full transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform motion-reduce:transition-none data-[visible=true]:translate-y-0"
            data-visible={visible}
            style={{ transitionDelay: visible ? `${i * 90}ms` : "0ms" }}
          >
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
