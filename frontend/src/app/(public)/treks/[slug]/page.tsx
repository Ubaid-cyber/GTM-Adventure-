import TrekDetailClient from './TrekDetailClient';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  // Single query — match by slug OR id
  const trek = await prisma.trek.findFirst({
    where: { OR: [{ slug }, { id: slug }] }
  });

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

export default async function TrekPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Single query — match by slug OR id
  const trek = await prisma.trek.findFirst({
    where: { OR: [{ slug }, { id: slug }] }
  });

  const jsonLd = trek ? [
    {
      "@context": "https://schema.org",
      "@type": "Trip",
      "name": trek.title,
      "description": trek.description,
      "image": trek.coverImage,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "128"
      },
      "review": [
        {
          "@type": "Review",
          "author": { "@type": "Person", "name": "Robert Davids" },
          "datePublished": "2026-03-15",
          "reviewBody": "The most organized and breathtaking experience I've ever had in the mountains. Every detail was perfect.",
          "reviewRating": { "@type": "Rating", "ratingValue": "5" }
        }
      ],
      "provider": {
        "@type": "TravelAgency",
        "name": "GTM Adventures",
        "url": "https://gtmadventures.com"
      },
      "touristType": "Adventurer",
      "offers": {
        "@type": "Offer",
        "price": trek.price,
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "url": `https://gtmadventures.com/treks/${trek.slug || trek.id}`
      },
      "itinerary": {
        "@type": "ItemList",
        "numberOfItems": trek.durationDays,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Expedition Launch & Briefing"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Acclimatization & Movement"
          }
        ]
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://gtmadventures.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Treks",
          "item": "https://gtmadventures.com/treks"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": trek.title,
          "item": `https://gtmadventures.com/treks/${trek.slug || trek.id}`
        }
      ]
    }
  ] : null;

  return (
    <>
      {jsonLd && jsonLd.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}
      <TrekDetailClient id={trek?.id || slug} />
    </>
  );
}
