import { NextApiRequest, NextApiResponse } from 'next';
import { DatabasePictureRepository } from '@/infra/DatabasePictureRepository';
import { Picture } from '@/domain/picture';

type SiteMapPage = {
  url: string;
  changefreq: string;
  priority: string;
  lastmod: string;
  picture?: Picture;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const baseUrl = 'https://www.miguelsoro.com';
  
  // Static pages with high priority
  const staticPages: SiteMapPage[] = [
    {
      url: baseUrl,
      changefreq: 'weekly',
      priority: '1.0',
      lastmod: new Date().toISOString()
    },
    {
      url: `${baseUrl}/biography`,
      changefreq: 'monthly',
      priority: '0.8',
      lastmod: new Date().toISOString()
    },
    {
      url: `${baseUrl}/news`,
      changefreq: 'weekly',
      priority: '0.7',
      lastmod: new Date().toISOString()
    },
    {
      url: `${baseUrl}/contact`,
      changefreq: 'monthly',
      priority: '0.6',
      lastmod: new Date().toISOString()
    }
  ];

  // Get pictures from database
  const pictureRepository = new DatabasePictureRepository();
  const pictures = await pictureRepository.findAll();
  
  // Dynamic picture pages - high priority for e-commerce
  const picturePages: SiteMapPage[] = pictures.map(picture => ({
    url: `${baseUrl}/pictures/${picture.slug}`,
    changefreq: 'monthly',
    priority: '0.9', // High priority for product pages
    lastmod: picture.updatedAt,
    picture: picture // Add picture data for image sitemap
  }));

  const allPages = [...staticPages, ...picturePages];

  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${page.picture ? `
    <image:image>
      <image:loc>${page.picture.imageUrl}</image:loc>
      <image:title>${page.picture.title}</image:title>
      <image:caption>${page.picture.description}</image:caption>
      <image:license>${baseUrl}</image:license>
    </image:image>` : ''}
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.status(200).send(sitemap);
}