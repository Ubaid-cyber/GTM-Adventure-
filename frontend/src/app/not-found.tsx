import Link from "next/link";
import { MoveLeft, Home, Compass } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Expedition Lost | GTM Adventures",
  description: "The peak you are looking for has not been discovered yet. Return to base camp to continue your journey.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-center font-sans">
      <div className="max-w-xl w-full">
        {/* Decorative 404 Visual */}
        <div className="relative mb-12">
          <h1 className="text-[12rem] md:text-[18rem] font-black text-white/5 tracking-tighter leading-none select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-primary/20 blur-[60px] rounded-full"></div>
            <Compass className="w-20 h-20 text-primary animate-[spin_10s_linear_infinite]" />
          </div>
        </div>

        <div className="space-y-6 relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">Expedition <span className="text-primary italic">Lost.</span></h2>
          <p className="text-white/40 text-lg font-medium max-w-md mx-auto leading-relaxed">
            The path you followed lead to a dead end. Our scouts are investigating, but for now, we recommend returning to Base Camp.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link 
              href="/" 
              className="flex items-center gap-3 px-8 py-4 bg-foreground text-background rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all group"
            >
              <Home size={16} /> Return to Base Camp
            </Link>
            <Link 
              href="/treks" 
              className="flex items-center gap-3 px-8 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Explore Other Routes <MoveLeft size={16} className="rotate-180" />
            </Link>
          </div>
        </div>

        {/* Technical Perimeter */}
        <div className="mt-24 pt-10 border-t border-white/5">
             <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em]">Protocol: Navigation-Error-Null-Reference</p>
        </div>
      </div>
    </div>
  );
}
