import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://gtmadventures.com';

  // Fetch all treks for dynamic sitemap
  const treks = await prisma.trek.findMany({
    select: { id: true, updatedAt: true },
  });

  const trekEntries = treks.map((trek) => ({
    url: `${baseUrl}/treks/${trek.id}`,
    lastModified: trek.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));


  // Fix: use current date for static routes lastModified
  const staticRoutes = ['', '/about', '/treks'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  return [...staticRoutes, ...trekEntries];
}
