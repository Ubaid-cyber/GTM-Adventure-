import React from 'react';

export default function MedicalAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 overflow-hidden flex flex-col font-sans selection:bg-cyan-500/30">
      {/* 
        This is a high-precision clinical isolation layer.
        It uses fixed positioning and tactical overlays to simulate a secure medical terminal.
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        header, footer { display: none !important; }
        body { padding-top: 0 !important; overflow: hidden !important; }
        
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        
        .hud-overlay::after {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to bottom,
            rgba(18, 16, 16, 0) 50%,
            rgba(0, 0, 0, 0.1) 50%
          );
          background-size: 100% 4px;
          z-index: 1000;
          pointer-events: none;
          opacity: 0.1;
        }
        
        .hud-scanline::after {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 10px;
          background: linear-gradient(to bottom, transparent, rgba(34, 211, 238, 0.1), transparent);
          animation: scanline 8s linear infinite;
          z-index: 1001;
          pointer-events: none;
        }

        .hud-grid {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      ` }} />
      
      <div className="flex-1 overflow-auto bg-slate-950 relative hud-overlay hud-scanline">
        <div className="absolute inset-0 hud-grid pointer-events-none"></div>
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
