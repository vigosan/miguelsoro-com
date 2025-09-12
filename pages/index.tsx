import { useState } from "react";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { List } from "@/components/List";
import { Filters } from "@/components/Filters";
import { WebsiteStructuredData } from "@/components/seo/StructuredData";
import { DatabasePictureRepository } from "@/infra/DatabasePictureRepository";
import { DatabaseProductTypeRepository } from "@/infra/DatabaseProductRepository";
import { Picture } from "@/domain/picture";
import { ProductType } from "@/domain/product";

interface IndexPageProps {
  initialPictures: Picture[];
  availableTypes: ProductType[];
}

export default function IndexPage({ initialPictures, availableTypes }: IndexPageProps) {
  const [pictures, setPictures] = useState<Picture[]>(initialPictures);
  const [filters, setFilters] = useState({
    productType: '',
    status: ''
  });

  // Client-side filtering (we could also implement server-side filtering via URL params if needed)
  const filteredPictures = pictures.filter((picture) => {
    if (filters.productType && !picture.productTypeName.toLowerCase().includes(filters.productType.toLowerCase())) {
      return false;
    }
    if (filters.status === 'AVAILABLE' && picture.stock <= 0) {
      return false;
    }
    if (filters.status === 'NOT_AVAILABLE' && picture.stock > 0) {
      return false;
    }
    return true;
  });

  return (
    <>
      <WebsiteStructuredData />
      <Layout
        title="Miguel Soro - Arte Ciclístico Original | Ex-Ciclista Profesional"
        description="Descubre la colección única de arte ciclístico de Miguel Soro, ex-ciclista profesional español. Obras originales en acrílico y collage inspiradas en el mundo del ciclismo. Compra arte deportivo contemporáneo."
        url="https://www.miguelsoro.com"
      >
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Obra
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Colección de obras de arte inspiradas en el mundo del ciclismo. 
            Cada pieza captura la emoción y la pasión del deporte sobre ruedas.
          </p>
        </div>
        
        <Filters 
          filters={filters} 
          onFiltersChange={setFilters}
          availableTypes={availableTypes.map(type => type.displayName)}
          resultCount={filteredPictures.length}
        />
        
        <List items={filteredPictures} />
      </div>
      </Layout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<IndexPageProps> = async () => {
  try {
    const pictureRepository = new DatabasePictureRepository();
    const productTypeRepository = new DatabaseProductTypeRepository();

    // Fetch pictures and product types in parallel
    const [pictures, productTypes] = await Promise.all([
      pictureRepository.findAll(),
      productTypeRepository.findAll()
    ]);

    return {
      props: {
        initialPictures: pictures,
        availableTypes: productTypes,
      },
    };
  } catch (error) {
    console.error('Error fetching data for homepage:', error);
    
    // Return empty arrays as fallback
    return {
      props: {
        initialPictures: [],
        availableTypes: [],
      },
    };
  }
};
