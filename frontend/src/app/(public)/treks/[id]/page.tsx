import TrekDetailClient from './TrekDetailClient';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const trek = await prisma.trek.findUnique({ where: { id } });
  const title = trek ? `${trek.title} | GTM Adventures` : 'Trek Details | GTM Adventures';
  const description = trek?.description?.substring(0, 160) || 'Discover amazing Himalayan treks with GTM Adventures.';
  const image = trek?.coverImage || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function TrekPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trek = await prisma.trek.findUnique({ where: { id } });

  const jsonLd = trek ? {
    "@context": "https://schema.org",
    "@type": "Trip",
    "name": trek.title,
    "description": trek.description,
    "image": trek.coverImage,
    "provider": {
      "@type": "TravelAgency",
      "name": "GTM Adventures"
    },
    "touristType": "Adventurer",
    "itinerary": {
      "@type": "ItemList",
      "numberOfItems": trek.durationDays,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Expedition Launch"
        }
      ]
    }
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <TrekDetailClient id={id} />
    </>
  );
}
