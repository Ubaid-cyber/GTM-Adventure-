import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://gtmadventures.com';
  let trekEntries: MetadataRoute.Sitemap = [];

  // 🛡️ Build-Time Circuit Breaker
  // If we are in a build environment or if DB_URL is missing, we fallback gracefully
  try {
    if (process.env.DATABASE_URL) {
      // Limit to 100 treks for build stability, can be increased later
      const treks = await prisma.trek.findMany({
        select: { id: true, updatedAt: true },
        take: 100, 
      }).catch(err => {
        console.error('Sitemap fetch failed (Caught):', err.message);
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
    }
  } catch (error) {
    console.warn('Sitemap dynamic generation skipped (Build Fallback active)');
  }

  const staticRoutes = ['', '/about', '/treks'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  return [...staticRoutes, ...trekEntries];
}
