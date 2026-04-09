import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://gtmadventures.com';
  let trekEntries: MetadataRoute.Sitemap = [];

  try {
    // Fetch all treks for dynamic sitemap
    // Note: findMany may fail during Vercel build if DB is not reachable
    const treks = await prisma.trek.findMany({
      select: { id: true, updatedAt: true },
    }).catch(err => {
      console.error('Sitemap DB check failed:', err);
      return [];
    });

    if (treks && treks.length > 0) {
      trekEntries = treks.map((trek) => ({
        url: `${baseUrl}/treks/${trek.id}`,
        lastModified: trek.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.warn('Sitemap build warning: Using static fallback.', error);
    // Continue with empty trekEntries so build doesn't fail
  }

  // Fix: use current date for static routes lastModified
  const staticRoutes = ['', '/about', '/treks'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  return [...staticRoutes, ...trekEntries];
}

