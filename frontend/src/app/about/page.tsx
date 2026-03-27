import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0 opacity-40">
           <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070" className="w-full h-full object-cover" alt="Mountains" />
        </div>
        <div className="relative z-10 text-center px-4">
           <h1 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-lg">Our Story</h1>
           <p className="text-xl text-gray-200 max-w-2xl mx-auto font-medium">Redefining the Himalayan experience through technology and high-altitude safety.</p>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Who We Are</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                GTM-Adventure was born out of a passion for the mountains and a frustration with traditional booking systems. We believe that discovering the Himalayas should be as breathtaking as the treks themselves.
              </p>
              <p className="text-gray-600 leading-relaxed">
                By combining advanced search technology (including our proprietary AI recommendations) with local expertise, we provide a seamless bridge between you and the summit.
              </p>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-2xl skew-y-1">
              <img src="https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=2070" alt="Trekkers" />
            </div>
          </div>

          <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[['500+', 'Successful Treks'], ['100%', 'Safety Record'], ['24/7', 'Expedition Support']].map(([val, label]) => (
              <div key={label} className="p-8 rounded-3xl bg-gray-50 border border-gray-100">
                <div className="text-4xl font-black text-green-600 mb-2">{val}</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</div>
              </div>
            ))}
          </div>

          <div className="mt-24 text-center">
            <Link href="/treks" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-black text-lg shadow-lg hover:shadow-xl transition-all active:scale-95">
              Start Your Journey
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
