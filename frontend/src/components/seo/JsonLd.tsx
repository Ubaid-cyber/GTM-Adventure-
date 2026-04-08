import React from 'react';

export default function JsonLd() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "GTM Adventures",
    "alternateName": "GTM-Adventure",
    "url": "https://gtmadventures.com/",
    "logo": "https://gtmadventures.com/logo.png",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200",
    "description": "Premier Himalayan treks and elite global expeditions with world-class safety protocols. Expert-led trips to Everest, Annapurna, and beyond.",
    "priceRange": "$$$",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Kathmandu",
      "addressRegion": "Bagmati",
      "addressCountry": "NP"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 27.7172,
      "longitude": 85.3240
    },
    "openingHours": "Mo-Fr 09:00-18:00",
    "hasMap": "https://maps.google.com/maps?cid=YOUR_GMB_ID_HERE",
    "serviceArea": [
      {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": 27.7172,
          "longitude": 85.3240
        },
        "geoRadius": "50000"
      },
      "Nepal",
      "India",
      "Bhutan"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+977-1-GTM-SAFETY",
      "contactType": "customer service",
      "email": "expeditions@gtmadventures.com",
      "availableLanguage": ["English", "Nepali"]
    }
  };

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "GTM Adventures",
    "url": "https://gtmadventures.com/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://gtmadventures.com/treks?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
        id="schema-org"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
        id="schema-website"
      />
    </>
  );
}
