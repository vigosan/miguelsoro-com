import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@/test/renderWithProviders";
import { useParallax } from "@/hooks/useParallax";

const renders = { count: 0 };

function Probe() {
  renders.count++;
  const { ref, targetRef } = useParallax<HTMLElement, HTMLDivElement>(0.35);
  return (
    <section ref={ref}>
      <div ref={targetRef} data-testid="parallax-target" />
    </section>
  );
}

describe("useParallax", () => {
  beforeEach(() => {
    renders.count = 0;
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});
  });

  it("positions the target through a CSS variable instead of React state", () => {
    render(<Probe />);

    const target = screen.getByTestId("parallax-target");
    // jsdom: rect 0x0 at top, viewport 768 → progress -0.5 → 0.5*0.35*100
    expect(target.style.getPropertyValue("--parallax-y")).toBe("17.5px");
  });

  it("never re-renders the component on scroll (the homepage hero re-rendered at 60fps)", () => {
    render(<Probe />);
    expect(renders.count).toBe(1);

    act(() => {
      for (let i = 0; i < 10; i++) {
        window.dispatchEvent(new Event("scroll"));
      }
    });

    expect(renders.count).toBe(1);
  });
});
