import { useState } from "react";
import { GetStaticProps } from "next";
import { Layout } from "@/components/Layout";
import { List } from "@/components/List";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import { Filters } from "@/components/Filters";
import { WebsiteStructuredData } from "@/components/seo/StructuredData";
import { DatabasePictureRepository } from "@/infra/DatabasePictureRepository";
import { DatabaseProductTypeRepository } from "@/infra/DatabaseProductRepository";
import { Picture } from "@/domain/picture";
import { ProductType } from "@/domain/product";

interface ObraPageProps {
  initialPictures: Picture[];
  availableTypes: ProductType[];
}

export default function ObraPage({
  initialPictures,
  availableTypes,
}: ObraPageProps) {
  const [pictures, setPictures] = useState<Picture[]>(initialPictures);
  const [filters, setFilters] = useState({
    productType: "",
    status: "",
  });

  // Client-side filtering
  const filteredPictures = pictures.filter((picture) => {
    if (
      filters.productType &&
      !picture.productTypeName
        .toLowerCase()
        .includes(filters.productType.toLowerCase())
    ) {
      return false;
    }
    if (filters.status === "AVAILABLE" && picture.stock <= 0) {
      return false;
    }
    if (filters.status === "NOT_AVAILABLE" && picture.stock > 0) {
      return false;
    }
    return true;
  });

  return (
    <>
      <WebsiteStructuredData />
      <Layout
        title="Obra - Miguel Soro | Arte Ciclístico Original"
        description="Explora la colección completa de arte ciclístico de Miguel Soro. Obras originales en acrílico y collage inspiradas en el mundo del ciclismo profesional."
        url="https://www.miguelsoro.com/obra"
      >
        <div className="py-16 lg:py-20 space-y-12">
          <Reveal>
            <SectionLabel prefix="Catálogo">Obra original</SectionLabel>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-4 tracking-tight">
              Obra
            </h1>
            <div className="mb-6 h-1 w-16 bg-accent"></div>
            <p className="text-lg text-gray-600 max-w-2xl text-pretty">
              Colección de obras inspiradas en el mundo del ciclismo. Cada pieza
              captura la emoción y la pasión del deporte sobre ruedas.
            </p>
          </Reveal>

          <Filters
            filters={filters}
            onFiltersChange={setFilters}
            availableTypes={availableTypes.map((type) => type.displayName)}
            resultCount={filteredPictures.length}
          />

          <List items={filteredPictures} />
        </div>
      </Layout>
    </>
  );
}

// ISR like the homepage and picture pages: the catalog changes rarely and
// the admin can trigger /api/revalidate for immediate updates.
export const getStaticProps: GetStaticProps<ObraPageProps> = async () => {
  try {
    const pictureRepository = new DatabasePictureRepository();
    const productTypeRepository = new DatabaseProductTypeRepository();

    // Fetch pictures and product types in parallel
    const [pictures, productTypes] = await Promise.all([
      pictureRepository.findAll(),
      productTypeRepository.findAll(),
    ]);

    return {
      props: {
        initialPictures: pictures,
        availableTypes: productTypes,
      },
      revalidate: 3600,
    };
  } catch (error) {
    console.error("Error fetching data for obra page:", error);

    // Return empty arrays as fallback, retrying sooner
    return {
      props: {
        initialPictures: [],
        availableTypes: [],
      },
      revalidate: 300,
    };
  }
};
