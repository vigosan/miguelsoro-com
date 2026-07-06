import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/renderWithProviders";
import { Layout } from "@/components/Layout";

vi.mock("next/head", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/Header", () => ({ Header: () => null }));
vi.mock("@/components/Footer", () => ({ Footer: () => null }));
vi.mock("@/components/cart/CartDrawer", () => ({ default: () => null }));
vi.mock("@vercel/analytics/react", () => ({ Analytics: () => null }));
vi.mock("react-hot-toast", () => ({ Toaster: () => null }));

const getMeta = (container: HTMLElement, property: string) =>
  container
    .querySelector(`meta[property="${property}"]`)
    ?.getAttribute("content");

describe("Layout social metadata", () => {
  it("builds og:image from the site origin, not the page URL", () => {
    // `${url}${image}` produced https://miguelsoro.com/obra/biography.webp
    // (a 404), so shared links showed no preview image at all.
    const { container } = render(
      <Layout url="https://www.miguelsoro.com/obra" image="/biography.webp" />,
    );

    expect(getMeta(container, "og:image")).toBe(
      "https://www.miguelsoro.com/biography.webp",
    );
  });

  it("passes absolute image URLs (blob storage) through untouched", () => {
    const { container } = render(
      <Layout
        url="https://www.miguelsoro.com/pictures/indurain"
        image="https://blob.example.com/indurain.webp"
      />,
    );

    expect(getMeta(container, "og:image")).toBe(
      "https://blob.example.com/indurain.webp",
    );
    expect(getMeta(container, "twitter:image")).toBe(
      "https://blob.example.com/indurain.webp",
    );
  });

  it("keeps the page URL as canonical", () => {
    const { container } = render(
      <Layout url="https://www.miguelsoro.com/obra" />,
    );

    expect(
      container.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    ).toBe("https://www.miguelsoro.com/obra");
  });
});
