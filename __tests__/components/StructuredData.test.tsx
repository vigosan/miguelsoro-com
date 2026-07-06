import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/renderWithProviders";
import { ArtworkStructuredData } from "@/components/seo/StructuredData";

vi.mock("next/head", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const baseArtwork = {
  id: "1",
  title: "Indurain",
  description: "Obra original",
  price: 1200,
  size: "120x90",
  imageUrl: "https://blob.example.com/indurain.webp",
  slug: "indurain",
  status: "AVAILABLE",
};

const renderSchema = (artwork: typeof baseArtwork) => {
  const { container } = render(
    <ArtworkStructuredData
      artwork={artwork}
      url="https://www.miguelsoro.com/pictures/indurain"
    />,
  );
  const script = container.querySelector('script[type="application/ld+json"]');
  expect(script).not.toBeNull();
  return JSON.parse(script!.innerHTML);
};

describe("ArtworkStructuredData", () => {
  it("advertises the real price in euros, not one hundredth of it", () => {
    // picture.price is already in euros (the repository converts from
    // cents); dividing again told Google a €1200 artwork costs €12.
    const schema = renderSchema(baseArtwork);

    expect(schema.offers.price).toBe("1200.00");
    expect(schema.offers.priceCurrency).toBe("EUR");
    expect(schema.offers.availability).toBe("https://schema.org/InStock");
  });

  it("marks works that are no longer available as out of stock", () => {
    const schema = renderSchema({ ...baseArtwork, status: "NOT_AVAILABLE" });

    expect(schema.offers.availability).toBe("https://schema.org/OutOfStock");
  });

  it("omits the offer entirely for price-on-request works instead of advertising €0", () => {
    const schema = renderSchema({ ...baseArtwork, price: 0 });

    expect(schema.offers).toBeUndefined();
  });

  it("emits an absolute image URL as schema.org requires", () => {
    const schema = renderSchema({
      ...baseArtwork,
      imageUrl: "/pictures/indurain.webp",
    });

    expect(schema.image).toBe(
      "https://www.miguelsoro.com/pictures/indurain.webp",
    );
  });
});
