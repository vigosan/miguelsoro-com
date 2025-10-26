import Head from "next/head";

interface ArtworkSchemaProps {
  artwork: {
    id: string;
    title: string;
    description: string;
    price: number;
    size: string;
    imageUrl: string;
    slug: string;
  };
  url: string;
}

export function ArtworkStructuredData({ artwork, url }: ArtworkSchemaProps) {
  const artworkSchema = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    "@id": `${url}#artwork`,
    name: artwork.title,
    description: artwork.description,
    image: artwork.imageUrl,
    url: url,
    creator: {
      "@type": "Person",
      name: "Miguel Soro",
      description:
        "Ex-ciclista profesional y artista contemporáneo especializado en arte ciclístico",
      url: "https://www.miguelsoro.com/biography",
      sameAs: ["https://www.miguelsoro.com"],
    },
    artform: "Painting",
    artMedium: "Acrílico y collage sobre lienzo",
    artworkSurface: "Canvas",
    width: {
      "@type": "QuantitativeValue",
      value: artwork.size.split("x")[0],
      unitCode: "CMT",
    },
    height: {
      "@type": "QuantitativeValue",
      value: artwork.size.split("x")[1],
      unitCode: "CMT",
    },
    material: ["Acrylic paint", "Canvas", "Collage"],
    genre: "Contemporary Art",
    category: "Cycling Art",
    offers:
      artwork.price > 0
        ? {
            "@type": "Offer",
            price: (artwork.price / 100).toFixed(2),
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
            url: url,
            seller: {
              "@type": "Person",
              name: "Miguel Soro",
            },
            itemCondition: "https://schema.org/NewCondition",
          }
        : {
            "@type": "Offer",
            price: "0",
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
            url: url,
            seller: {
              "@type": "Person",
              name: "Miguel Soro",
            },
            priceSpecification: {
              "@type": "PriceSpecification",
              price: "Consultar",
              priceCurrency: "EUR",
            },
          },
    keywords: [
      "arte ciclístico",
      "cycling art",
      "Miguel Soro",
      "ciclismo profesional",
      "arte contemporáneo",
      "acrílico sobre lienzo",
      "collage",
      "deporte arte",
      "ex-ciclista",
      "obra original",
    ],
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(artworkSchema),
        }}
      />
    </Head>
  );
}

interface WebsiteSchemaProps {
  url?: string;
}

export function WebsiteStructuredData({
  url = "https://www.miguelsoro.com",
}: WebsiteSchemaProps) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}#website`,
    url: url,
    name: "Miguel Soro - Arte Ciclístico",
    description:
      "Galería de arte de Miguel Soro, ex-ciclista profesional. Obras originales inspiradas en el mundo del ciclismo. Acrílico y collage sobre lienzo.",
    publisher: {
      "@type": "Person",
      "@id": `${url}#artist`,
      name: "Miguel Soro",
      description:
        "Ex-ciclista profesional español convertido en artista. Especializado en arte contemporáneo inspirado en el ciclismo.",
      url: `${url}/biography`,
      birthDate: "1976-02-27",
      birthPlace: {
        "@type": "Place",
        name: "Xàtiva, Valencia, España",
      },
      nationality: "Spanish",
      jobTitle: "Artista y Ex-ciclista Profesional",
      hasOccupation: [
        {
          "@type": "Occupation",
          name: "Visual Artist",
          description:
            "Contemporary artist specializing in cycling-themed artwork",
        },
        {
          "@type": "Occupation",
          name: "Professional Cyclist",
          description:
            "Former professional cyclist who competed in Portugal and Italy",
        },
      ],
      knowsAbout: [
        "Cycling",
        "Contemporary Art",
        "Acrylic Painting",
        "Collage Techniques",
        "Sports Art",
      ],
    },
    mainEntity: {
      "@type": "ItemList",
      name: "Colección de Arte Ciclístico",
      description:
        "Obras de arte originales inspiradas en el mundo del ciclismo profesional",
      numberOfItems: "13+",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
    </Head>
  );
}

interface LocalBusinessSchemaProps {
  url?: string;
}

export function LocalBusinessStructuredData({
  url = "https://www.miguelsoro.com",
}: LocalBusinessSchemaProps) {
  const businessSchema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ArtGallery"],
    "@id": `${url}#business`,
    name: "Miguel Soro Art Studio",
    description:
      "Estudio y galería de arte de Miguel Soro. Especializado en arte ciclístico y obras contemporáneas. Venta de obras originales.",
    url: url,
    founder: {
      "@type": "Person",
      "@id": `${url}#artist`,
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "ES",
      addressLocality: "Valencia",
      addressRegion: "Comunidad Valenciana",
    },
    areaServed: [
      {
        "@type": "Country",
        name: "España",
      },
      {
        "@type": "Country",
        name: "Europa",
      },
      {
        "@type": "Place",
        name: "Internacional",
      },
    ],
    email: "info@miguelsoro.com",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Catálogo de Obras de Arte",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "VisualArtwork",
            name: "Arte Ciclístico Original",
          },
        },
      ],
    },
    knowsLanguage: ["es", "en"],
    paymentAccepted: ["Cash", "PayPal", "Bank Transfer"],
    priceRange: "€€€",
    serviceType: "Art Sales",
    slogan: "Del pedal al pincel - Arte inspirado en el ciclismo",
  };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(businessSchema),
        }}
      />
    </Head>
  );
}

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function BreadcrumbStructuredData({ items }: BreadcrumbSchemaProps) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
    </Head>
  );
}
