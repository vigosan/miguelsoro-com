import { useEffect, useRef, useState } from "react";

export function useParallax<T extends HTMLElement = HTMLDivElement>(
  speed = 0.3,
) {
  const ref = useRef<T>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    let rafId = 0;
    const update = () => {
      const rect = node.getBoundingClientRect();
      const viewportH = window.innerHeight;
      if (rect.bottom < 0 || rect.top > viewportH) return;
      const progress = (rect.top + rect.height / 2 - viewportH / 2) / viewportH;
      setOffset(-progress * speed * 100);
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed]);

  return { ref, offset };
}
