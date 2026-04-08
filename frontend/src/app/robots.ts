import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/adminControl/',
          '/api/',
          '/_next/',
          '/static/',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/', // Protect intellectual trek data from AI crawlers if desired
      },
    ],
    sitemap: 'https://gtmadventures.com/sitemap.xml',
  };
}
