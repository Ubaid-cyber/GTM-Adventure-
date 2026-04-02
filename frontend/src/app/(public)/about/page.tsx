import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About Us | GTM Adventures",
  description: "Learn about GTM Adventures, the premier Himalayan trek booking platform. Discover our philosophy, safety commitment, and expert-led expeditions.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pt-16">

      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070"
          className="w-full h-full object-cover"
          alt="Mountains"
        />
        <div className="absolute inset-0 bg-primary/60 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">About Us</h1>
            <p className="text-blue-100 text-sm md:text-base max-w-xl mx-auto px-4">
              Redefining the Himalayan experience through technology and high-altitude safety.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Who We Are</h2>
            <p className="text-muted leading-relaxed mb-4">
              GTM-Adventure was born out of a passion for the mountains and a frustration with traditional booking systems.
              We believe that discovering the Himalayas should be as breathtaking as the treks themselves.
            </p>
            <p className="text-muted leading-relaxed">
              By combining advanced AI search technology with local expertise, we provide a seamless bridge between
              you and the summit.
            </p>
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg border border-border">
            <img
              src="https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=800"
              alt="Trekkers"
              className="w-full h-64 object-cover"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {[['500+', 'Successful Treks'], ['100%', 'Safety Record'], ['24/7', 'Support']].map(([val, label]) => (
            <div key={label} className="bg-white rounded-xl border border-border p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-primary mb-1">{val}</div>
              <div className="text-sm text-muted font-medium">{label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/treks"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-lg font-semibold text-sm transition-colors shadow-sm"
          >
            Explore All Treks
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
