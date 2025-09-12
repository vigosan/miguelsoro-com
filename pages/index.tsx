import { useState } from "react";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { List } from "@/components/List";
import { Filters } from "@/components/Filters";
import { usePicturesPublic } from "@/hooks/usePicturesPublic";
import { useProductTypesPublic } from "@/hooks/useProductTypes";
import { WebsiteStructuredData } from "@/components/seo/StructuredData";

export default function IndexPage() {
  const [filters, setFilters] = useState({
    productType: '',
    inStock: null as boolean | null,
    status: ''
  });

  // Build filters for API call
  const apiFilters: any = {};
  if (filters.productType) apiFilters.productType = filters.productType;
  if (filters.inStock !== null) apiFilters.inStock = filters.inStock;
  if (filters.status) apiFilters.status = filters.status as 'AVAILABLE' | 'SOLD';

  const { data: pictures = [], isLoading } = usePicturesPublic(
    Object.keys(apiFilters).length > 0 ? apiFilters : undefined
  );
  const { data: availableTypes = [] } = useProductTypesPublic();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando obras...</p>
          </div>
        </div>
      </Layout>
    );
  }

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
          availableTypes={availableTypes}
        />
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {pictures.length} obra{pictures.length !== 1 ? 's' : ''} encontrada{pictures.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <List items={pictures} />
      </div>
      </Layout>
    </>
  );
}
