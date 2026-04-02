import React from 'react';

export default function JsonLd() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "GTM Adventures",
    "alternateName": "GTM-Adventure",
    "url": "https://gtmadventures.com/",
    "logo": "https://gtmadventures.com/logo.png", // Assuming a logo exists at this path
    "sameAs": [
      "https://facebook.com/gtmadventures",
      "https://instagram.com/gtmadventures",
      "https://twitter.com/gtmadventures"
    ],
    "description": "Premier Himalayan treks with world-class safety protocols. Expert-led expeditions to Everest, Annapurna, and more.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "Nepal"
    },
    "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+977-1-4XXXXXX",
        "contactType": "customer service",
        "email": "expeditions@gtmadventures.com"
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
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      />
    </>
  );
}
