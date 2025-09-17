export type NewsType = 'premio' | 'exposicion' | 'entrevista' | 'evento' | 'video';

export type News = {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: NewsType;
  date: string; // Date in YYYY-MM-DD format
  location?: string;
  externalUrl?: string;
  published: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
};

export type CreateNewsData = Pick<News, 'title' | 'description' | 'type' | 'date' | 'location' | 'externalUrl' | 'published'>;
export type UpdateNewsData = Partial<CreateNewsData>;

// Helper function to generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Remove duplicate hyphens
}

// Helper function to get news type display info
export function getNewsTypeInfo(type: NewsType) {
  const typeMap = {
    premio: { 
      label: 'Premio', 
      bgColor: 'bg-yellow-100', 
      textColor: 'text-yellow-800',
      icon: 'trophy'
    },
    exposicion: { 
      label: 'Exposición', 
      bgColor: 'bg-green-100', 
      textColor: 'text-green-800',
      icon: 'photo'
    },
    entrevista: { 
      label: 'Entrevista', 
      bgColor: 'bg-blue-100', 
      textColor: 'text-blue-800',
      icon: 'microphone'
    },
    evento: { 
      label: 'Evento', 
      bgColor: 'bg-purple-100', 
      textColor: 'text-purple-800',
      icon: 'calendar'
    },
    video: { 
      label: 'Video', 
      bgColor: 'bg-red-100', 
      textColor: 'text-red-800',
      icon: 'play'
    }
  };
  
  return typeMap[type];
}

// Helper function to format date for display
export function formatNewsDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long' 
  });
}

// Helper function to sort news by date (newest first)
export function sortNewsByDate(newsArray: News[]): News[] {
  return newsArray.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}