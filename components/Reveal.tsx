import type { ElementType, ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
};

export function Reveal({ children, className = "", delay = 0, as }: Props) {
  const { ref, visible } = useReveal();
  const Tag = as ?? "div";

  return (
    <Tag
      ref={ref}
      className={`transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[opacity,transform] motion-reduce:transition-none ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}
