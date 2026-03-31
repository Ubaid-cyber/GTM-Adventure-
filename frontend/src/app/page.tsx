'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Shield, Globe, Zap, ArrowRight, Star, ChevronRight } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="bg-white min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000" 
            alt="Himalayan Peak" 
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
              Premier Himalayan Treks
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-8 max-w-4xl mx-auto">
              Your Journey, <br />
              <span className="italic font-serif text-white/90">Redefined.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-medium mb-10 leading-relaxed">
              Experience the Himalayas with unparalleled safety. 
              World-class treks led by expert guides and supported by a dedicated safety team.
            </p>
            
            {/* 2. DISCOVERY ENGINE (Luxury Search) */}
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-2 flex flex-col md:flex-row items-center gap-2">
              <div className="flex-1 w-full px-4 py-3 flex items-center gap-3 border-b md:border-b-0 md:border-r border-slate-100">
                <Search className="w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Where do you want to climb?" 
                  className="w-full bg-transparent border-none focus:outline-none text-slate-700 font-medium placeholder:text-slate-400"
                />
              </div>
              <div className="flex-1 w-full px-4 py-3 flex items-center gap-3">
                <Globe className="w-5 h-5 text-slate-400" />
                <select className="w-full bg-transparent border-none focus:outline-none text-slate-700 font-medium appearance-none">
                  <option>All Regions</option>
                  <option>Nepal (Everest)</option>
                  <option>India (Ladakh)</option>
                  <option>Bhutan</option>
                </select>
              </div>
              <Link href="/treks" className="w-full md:w-auto px-10 py-4 bg-primary text-white rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-primary-hover transition-all">
                Search
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent"></div>
        </motion.div>
      </section>

      {/* 3. TRUST BAR */}
      <section className="py-12 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-20 opacity-40 grayscale transition-all hover:grayscale-0">
             <div className="text-xl font-black italic tracking-tighter text-slate-800">EXPEDITIONS UNLIMITED</div>
             <div className="text-xl font-bold tracking-widest text-slate-800">SAFETY FIRST®</div>
             <div className="text-xl font-serif text-slate-800 italic">Global Adventure Board</div>
             <div className="text-xl font-bold text-slate-800 tracking-tighter uppercase">Himalayan Alliance</div>
          </div>
        </div>
      </section>

      {/* 4. THE SAFETY FRAMEWORK (Tech/Safety) */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mb-16">
            <span className="text-primary text-xs font-black uppercase tracking-[0.3em] mb-4 block">The GTM Difference</span>
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-6">Expert Planning for Unbeatable Safety.</h2>
            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              We operate a comprehensive safety framework that supports you to the summit. 
              Behind every trek is a dedicated team and robust infrastructure designed to ensure you return with incredible memories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: "Seamless Support", 
                desc: "Our dedicated support team ensures you remain connected to our basecamp and your family, even in the most remote valleys.",
                icon: Zap
              },
              { 
                title: "Precision Vitals", 
                desc: "Professional health monitoring by our mountain experts to ensure your well-being throughout the journey.",
                icon: Shield
              },
              { 
                title: "Expert Personnel", 
                desc: "Every expedition is led by a veteran with a minimum of 10 years Himalayan experience and UIAA certification.",
                icon: Globe
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-[32px] border border-slate-200 shadow-sm transition-all"
              >
                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SIGNATURE COLLECTIONS */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-16">
            <div>
              <span className="text-primary text-xs font-black uppercase tracking-[0.3em] mb-4 block">Curated Expeditions</span>
              <h2 className="text-4xl font-bold text-slate-900 tracking-tight">The Signature Collection.</h2>
            </div>
            <Link href="/treks" className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-primary transition-colors group">
              View All Treks <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
               { name: "Everest Base Camp", region: "Khumbu Region, Nepal", img: "https://images.unsplash.com/photo-1544735716-e9255651586b?auto=format&fit=crop&q=80&w=800" },
               { name: "Manaslu Circuit", region: "Manaslu, Nepal", img: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&q=80&w=800" },
               { name: "Markha Valley", region: "Ladakh, India", img: "https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&q=80&w=800" }
            ].map((trek, i) => (
              <motion.div 
                key={i}
                className="group cursor-pointer"
              >
                <div className="relative h-[450px] rounded-[32px] overflow-hidden mb-6">
                  <img 
                    src={trek.img} 
                    alt={trek.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-8 left-8 right-8 text-white">
                    <div className="flex items-center gap-1 mb-2">
                       {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-accent text-accent" />)}
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight mb-1">{trek.name}</h3>
                    <p className="text-sm text-white/70 font-medium">{trek.region}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA SECTION */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto bg-slate-900 rounded-[48px] p-12 md:p-24 relative overflow-hidden text-center">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 blur-[120px] rounded-full"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-8">Ready to transcend the <br /> ordinary?</h2>
              <p className="text-white/60 text-lg max-w-xl mx-auto mb-12 leading-relaxed">
                Connect with our trek specialists and begin the registration process for your next mountain journey.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/register" className="px-10 py-4 bg-white text-slate-900 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-slate-100 transition-all">
                  Register Now
                </Link>
                <Link href="/about" className="px-10 py-4 bg-white/10 text-white border border-white/20 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-white/20 transition-all">
                  Our Philosophy
                </Link>
              </div>
            </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rotate-45"></div>
            </div>
            <span className="font-black text-slate-900 tracking-tighter uppercase">GTM ADVENTURES</span>
          </div>
          <div className="flex gap-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Link href="/treks" className="hover:text-primary transition-colors">Treks</Link>
            <Link href="/about" className="hover:text-primary transition-colors">Philosophy</Link>
            <Link href="/login" className="hover:text-primary transition-colors">Login / Signup</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
          </div>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">© 2026 GTM ADVENTURES LTD.</p>
        </div>
      </footer>
    </main>
  );
}
