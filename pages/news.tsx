import { GetStaticProps } from 'next';
import { Layout } from "@/components/Layout";
import { NewsCard } from "@/components/NewsCard";
import { News } from '@/domain/news';
import { SupabaseNewsRepository } from '@/infra/SupabaseNewsRepository';

type NewsPageProps = {
  news: News[];
  error?: string;
};

export default function NewsPage({ news, error }: NewsPageProps) {
  if (error) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Noticias
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Mantente al día con las últimas exposiciones, eventos y apariciones en medios. 
              Descubre el impacto del arte ciclista en la comunidad.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center py-12">
              <div className="text-red-500">Error al cargar las noticias: {error}</div>
            </div>
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
            Noticias
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Mantente al día con las últimas exposiciones, eventos y apariciones en medios. 
            Descubre el impacto del arte ciclista en la comunidad.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-6">
          {news.map((newsItem) => (
            <div key={newsItem.id}>
              {newsItem.type === 'video' && newsItem.id === '6' ? (
                // Special handling for the RTVE video
                <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {newsItem.title}
                    </h2>
                    <p className="text-gray-600">
                      {newsItem.description}
                    </p>
                  </div>
                  <div className="p-6">
                    <video 
                      controls 
                      className="aspect-video h-auto w-full rounded-lg shadow-sm"
                      poster="/images/video-thumbnail.jpg"
                    >
                      <source src="/videos/tve1.mp4" type="video/mp4" />
                      <source src="/videos/tve1.ogg" type="video/ogg" />
                      Your browser does not support the video tag.
                    </video>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm text-gray-500">Televisión Española</span>
                      {newsItem.externalUrl && (
                        <a
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          href={newsItem.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Ver en RTVE Play →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <NewsCard news={newsItem} />
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-700">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Más noticias próximamente
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<NewsPageProps> = async () => {
  try {
    const repository = new SupabaseNewsRepository();
    const news = await repository.findPublished();
    
    return {
      props: {
        news,
      },
      // Revalidate every hour (3600 seconds)
      // The page will be regenerated at most once per hour when there are requests
      revalidate: 3600,
    };
  } catch (error) {
    console.error('Error fetching news:', error);
    
    return {
      props: {
        news: [],
        error: error instanceof Error ? error.message : 'Error loading news',
      },
      // On error, retry after 5 minutes
      revalidate: 300,
    };
  }
};
