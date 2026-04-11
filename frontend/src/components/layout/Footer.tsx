'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight,
  Shield,
  CreditCard
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-20 pb-10 overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Top Grid: Newsletter & Brand */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-20 border-b border-white/5">
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <svg className="w-6 h-6 text-white" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 4L2 28H30L16 4Z" fill="currentColor"/>
                </svg>
              </div>

              <span className="text-2xl font-black text-white tracking-tighter uppercase italic">GTM Adventures</span>
            </div>
            <p className="text-white/50 text-lg font-medium leading-relaxed max-w-md italic">
              "Elevating Himalayan exploration through precision safety and elite expedition management."
            </p>
            <div className="flex gap-5">
              {[Instagram, Facebook, Youtube, Twitter].map((Icon, i) => (
                <Link key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-primary hover:border-primary/30 transition-all group">
                   <Icon size={18} className="group-hover:scale-110 transition-transform" />
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1"></div>

          <div className="lg:col-span-6">
             <div className="bg-white border border-slate-100 rounded-[32px] p-8 md:p-10 shadow-2xl relative overflow-hidden group">
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                   <Mail className="w-24 h-24 text-primary" />
                </div>

                <div className="relative z-10">
                  <h3 className="text-xl font-black mb-2 italic uppercase tracking-tighter" style={{ color: '#020617' }}>Stay Updated</h3>
                  <p className="text-slate-500 text-xs mb-8 font-bold uppercase tracking-widest">Get the latest news and exclusive trek offers.</p>
                  <form className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="email" 
                        placeholder="Your email address" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-primary focus:bg-white transition-all shadow-inner font-bold"
                      />
                    </div>
                    <button className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all flex items-center justify-center gap-2 group whitespace-nowrap shadow-lg shadow-primary/20">
                      Subscribe <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                </div>
             </div>
          </div>
        </div>

        {/* Link Columns Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 py-20">
          
          {/* Column 1: Tour Packages */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Tour Packages</h4>
            <ul className="space-y-4">
              <li><Link href="/treks" className="text-sm font-bold text-white/40 hover:text-white transition-colors">Nepal Expeditions</Link></li>
              <li><Link href="/treks" className="text-sm font-bold text-white/40 hover:text-white transition-colors">High Altitude Tours</Link></li>
              <li><Link href="/treks" className="text-sm font-bold text-white/40 hover:text-white transition-colors">Cultural Journeys</Link></li>
              <li><Link href="/treks" className="text-sm font-bold text-white/40 hover:text-white transition-colors">Himalayan Circuits</Link></li>
            </ul>
          </div>

          {/* Column 2: Dashboard */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Client Area</h4>
            <ul className="space-y-4">
              <li><Link href="/dashboard/bookings" className="text-sm font-bold text-white/40 hover:text-white transition-colors">My Bookings</Link></li>
              <li><Link href="/dashboard/health" className="text-sm font-bold text-white/40 hover:text-white transition-colors">Medical Dashboard</Link></li>
              <li><Link href="/dashboard/bookings" className="text-sm font-bold text-white/40 hover:text-white transition-colors">Live Updates</Link></li>
              <li><Link href="/dashboard/profile" className="text-sm font-bold text-white/40 hover:text-white transition-colors">Account Settings</Link></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Company</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-sm font-bold text-white/40 hover:text-white transition-colors">Our Philosophy</Link></li>
              <li><Link href="#" className="text-sm font-bold text-white/40 hover:text-white transition-colors">Safety Standards</Link></li>
              <li><Link href="#" className="text-sm font-bold text-white/40 hover:text-white transition-colors">Sustainability</Link></li>
              <li><Link href="#" className="text-sm font-bold text-white/40 hover:text-white transition-colors">Careers</Link></li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Support</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm font-bold text-white/40">
                <Phone size={14} className="text-primary/50 flex-shrink-0" /> +91 6005888754
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-white/40 break-all">
                <Mail size={14} className="text-primary/50 flex-shrink-0" /> info@gtmadventures.com
              </li>
              <li className="flex items-start gap-3 text-sm font-bold text-white/40 leading-relaxed max-w-[240px]">
                <MapPin size={16} className="text-primary/50 flex-shrink-0 mt-0.5" /> 
                <span>House No 5A, 1st Floor, Devlok Colony, Chandrabani Road, Majra, Dehradun, Uttarakhand</span>
              </li>
            </ul>
          </div>

          {/* Column 5: Legal */}
          <div className="space-y-6 lg:text-right lg:items-end flex flex-col">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Legal</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-sm font-bold text-white/40 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-sm font-bold text-white/40 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-sm font-bold text-white/40 hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section: Trust & Copyright */}
        <div className="pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8">
           <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
             © 2026 GTM ADVENTURES LTD. // REDEFINING THE ALTITUDE.
           </p>
           
           <div className="flex items-center gap-8 opacity-40 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-3">
                 <img src="/images/pci-dss.svg" alt="PCI-DSS Secured" className="h-8 w-auto" />
                 <span className="text-[9px] font-black text-white uppercase tracking-widest leading-none">SECURED BY <br/> PCI-DSS</span>
              </div>
              <div className="flex items-center gap-3">
                 <img src="/images/razorpay.svg" alt="Razorpay Verified" className="h-7 w-auto" />
                 <span className="text-[9px] font-black text-white uppercase tracking-widest leading-none">VERIFIED <br/> MERCHANT</span>
              </div>
           </div>
        </div>

      </div>
    </footer>
  );
}
