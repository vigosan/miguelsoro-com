import type { ElementType, ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";

type Direction = "up" | "left" | "right";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  from?: Direction;
  clip?: boolean;
  as?: ElementType;
};

const hidden: Record<Direction, string> = {
  up: "opacity-0 translate-y-8",
  left: "opacity-0 -translate-x-6",
  right: "opacity-0 translate-x-6",
};

export function Reveal({
  children,
  className = "",
  delay = 0,
  from = "up",
  clip = false,
  as,
}: Props) {
  const { ref, visible } = useReveal();
  const Tag = as ?? "div";

  if (clip) {
    return (
      <Tag
        ref={ref}
        className={`transition-[clip-path] duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[clip-path] motion-reduce:transition-none ${className}`}
        style={{
          clipPath: visible ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
          transitionDelay: visible ? `${delay}ms` : "0ms",
        }}
      >
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref}
      className={`transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[opacity,transform] motion-reduce:transition-none ${
        visible ? "opacity-100 translate-x-0 translate-y-0" : hidden[from]
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}
