import Link from "next/link";
import { Layout } from "@/components/Layout";
import { List } from "@/components/List";
import { usePicturesPublic } from "@/hooks/usePicturesPublic";

export default function IndexPage() {
  const { data: pictures = [], isLoading } = usePicturesPublic();

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
    <Layout>
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
        <List items={pictures} />
      </div>
    </Layout>
  );
}

export function IndexPageLink({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href="/" className={className}>
      {children}
    </Link>
  );
}
