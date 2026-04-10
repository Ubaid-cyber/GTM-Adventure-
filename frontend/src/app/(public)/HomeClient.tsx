'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Search, Shield, Globe, Zap, ArrowRight, Star } from 'lucide-react';

export default function HomeClient() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedRegion, setSelectedRegion] = React.useState('');
  const router = useRouter();

  const handleSearch = (e?: React.FormEvent) => {
     if (e) e.preventDefault();
     const combinedQuery = [searchQuery, selectedRegion === 'All Regions' ? '' : selectedRegion]
       .filter(Boolean)
       .join(' ')
       .trim();
     
     if (combinedQuery) {
       router.push(`/treks?q=${encodeURIComponent(combinedQuery)}`);
     } else {
       router.push('/treks');
     }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
     if (e.key === 'Enter') handleSearch();
  };

  return (
    <main className="bg-white min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative h-[95vh] flex items-center justify-center overflow-hidden">
        {/* Cinematic Background - Overlays removed as requested for full image visibility */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000" 
            alt="Elite Global Adventure & Expedition Management - GTM Adventures" 
            className="w-full h-full object-cover scale-105"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center pt-24 md:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-6 drop-shadow-sm">
              Premier Global Adventure Expeditions
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-8 max-w-4xl mx-auto drop-shadow-2xl">
              Elite Adventure Booking <br />
              <span className="italic font-serif text-white/90">Experience Redefined.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-medium mb-20 leading-relaxed drop-shadow-lg">
              Conquer the world's most breathtaking landscapes with unparalleled safety. 
              World-class expeditions led by expert guides and supported by our dedicated safety team.
            </p>
            
            {/* 2. DISCOVERY ENGINE (Hero Version) */}
            <div className="hidden md:flex max-w-3xl mx-auto bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-2 items-center gap-2 border border-white/10 mb-24 -translate-y-8 md:-translate-y-12">
              <div className="flex-1 px-4 py-3 flex items-center gap-3 border-r border-white/10">
                <Search className="w-5 h-5 text-white/40" />
                <input 
                  type="text" 
                  placeholder="Where is your next mission?" 
                  className="w-full bg-transparent border-none focus:outline-none text-white font-medium placeholder:text-white/40"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  aria-label="Search for tour packages"
                />
              </div>
              <div className="flex-1 px-4 py-3 flex items-center gap-3">
                <Globe className="w-5 h-5 text-white/40" />
                <select 
                  className="w-full bg-transparent border-none focus:outline-none text-white/90 font-bold text-sm appearance-none cursor-pointer [&>option]:bg-slate-900"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  aria-label="Select region"
                >
                  <option value="">Global Regions</option>
                  <option value="Nepal">Nepal (Himalayas)</option>
                  <option value="India">India (Kashmir & Ladakh)</option>
                  <option value="Bhutan">Bhutan</option>
                  <option value="Africa">Africa (Kilimanjaro)</option>
                </select>
              </div>
              <button 
                onClick={() => handleSearch()}
                className="px-10 py-4 bg-white text-slate-900 rounded-xl font-black text-xs tracking-widest uppercase hover:bg-slate-100 transition-all shadow-xl shadow-white/5"
              >
                Search
              </button>
            </div>

            {/* Mobile View Hero - Enhanced Contrast */}
            <div className="md:hidden max-w-sm mx-auto bg-slate-950/70 backdrop-blur-3xl rounded-[32px] overflow-hidden border border-white/10 p-2 mb-20 -translate-y-12 shadow-2xl">
              <div className="p-8 text-left space-y-6">
                <input 
                  type="text" 
                  placeholder="Search Tour Packages..." 
                  className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 px-5 text-sm text-white focus:outline-none transition-all font-medium placeholder:text-white/40"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button 
                  onClick={() => handleSearch()}
                  className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-3 shadow-lg shadow-white/5"
                >
                  Explore <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent"></div>
          </motion.div>
        </div>
      </section>

      {/* 4. THE SAFETY FRAMEWORK */}
      <section className="py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mb-16">
            <span className="text-blue-600 text-xs font-black uppercase tracking-[0.3em] mb-4 block">The GTM Difference</span>
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-6">Expert Planning for Unbeatable Trekking Safety.</h2>
            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              We operate a comprehensive safety framework that supports you to the summit. 
              Behind every trek is a dedicated team and robust infrastructure designed to ensure you return with incredible memories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: "Seamless Support", 
                desc: "Our dedicated support team ensures you remain connected to our Command Center and your family, even in the most remote valleys of the Himalayas.",
                icon: Zap
              },
              { 
                title: "Precision Vitals", 
                desc: "Professional health monitoring by our mountain experts to ensure your well-being throughout the Everest or Annapurna journey.",
                icon: Shield
              },
              { 
                title: "Expert Personnel", 
                desc: "Every expedition is led by a veteran with a minimum of 10 years Himalayan experience and UIAA certification for maximum safety.",
                icon: Globe
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-[32px] border border-slate-200 shadow-sm transition-all"
              >
                <div className="w-12 h-12 bg-blue-600/5 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SIGNATURE COLLECTIONS */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-16">
            <div>
              <span className="text-blue-600 text-xs font-black uppercase tracking-[0.3em] mb-4 block">Hand-Picked Adventures</span>
              <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Signature Tour Packages.</h2>
            </div>
            <Link href="/treks" className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors group">
              Explore All Tours <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            { [
               { name: "Everest Base Camp", region: "Khumbu Region, Nepal", img: "https://images.unsplash.com/photo-1544735716-e9255651586b?auto=format&fit=crop&q=80&w=800" },
               { name: "Manaslu Circuit", region: "Manaslu, Nepal", img: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&q=80&w=800" },
               { name: "Markha Valley", region: "Ladakh, India", img: "https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&q=80&w=800" }
            ].map((trek, i) => (
              <Link key={i} href="/treks" className="block group">
                <motion.div 
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="cursor-pointer"
                >
                  <div className="relative h-[450px] rounded-[32px] overflow-hidden mb-6 shadow-lg group-hover:shadow-2xl group-hover:shadow-blue-600/20 transition-all duration-500">
                    <img 
                      src={trek.img} 
                      alt={`Trekking ${trek.name} in ${trek.region} - GTM Adventures`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                    <div className="absolute bottom-8 left-8 right-8 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic leading-none mb-2">{trek.name}</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-white/70 font-bold uppercase tracking-widest">{trek.region}</p>
                        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                          <ArrowRight size={20} className="text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA SECTION */}
      <section className="py-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto bg-slate-900 rounded-[48px] p-12 md:p-24 relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-8">Ready to transcend the <br /> ordinary?</h2>
              <p className="text-white/60 text-lg max-w-xl mx-auto mb-12 leading-relaxed">
                Connect with our trek specialists and begin the registration process for your next mountain journey.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/signup" className="px-10 py-4 bg-white text-slate-900 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-slate-100 transition-all">
                  Register Now
                </Link>
                <Link href="/about" className="px-10 py-4 bg-white/10 text-white border border-white/20 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-white/20 transition-all">
                  Our Philosophy
                </Link>
              </div>
            </div>
        </div>
      </section>
    </main>
  );
}
