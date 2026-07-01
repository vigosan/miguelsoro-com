import { useState } from "react";
import { GetServerSideProps } from "next";
import { Layout } from "@/components/Layout";
import { List } from "@/components/List";
import { Reveal } from "@/components/Reveal";
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
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-6">
              Catálogo — Obra original
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 tracking-tight">
              Obra
            </h1>
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

export const getServerSideProps: GetServerSideProps<
  ObraPageProps
> = async () => {
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
    };
  } catch (error) {
    console.error("Error fetching data for obra page:", error);

    // Return empty arrays as fallback
    return {
      props: {
        initialPictures: [],
        availableTypes: [],
      },
    };
  }
};
