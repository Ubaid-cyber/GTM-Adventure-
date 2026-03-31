'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ItineraryDay {
  day: number;
  title: string;
  activity: string;
  alt?: number;
}

interface ItineraryTimelineProps {
  itinerary: ItineraryDay[];
}

export default function ItineraryTimeline({ itinerary }: ItineraryTimelineProps) {
  if (!itinerary || itinerary.length === 0) {
    return <div className="text-muted italic">Detailed itinerary is being finalized by our expedition leads.</div>;
  }

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
      {itinerary.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group select-none"
        >
          {/* Dot */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-all group-hover:border-primary/50 group-hover:scale-110">
            <span className="text-primary font-bold text-xs">{item.day}</span>
          </div>

          {/* Content */}
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl border border-border bg-surface/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:border-primary/20 hover:bg-surface">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
               <h4 className="font-black text-lg text-foreground tracking-tight">{item.title}</h4>
               {item.alt && (
                 <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-md uppercase tracking-widest whitespace-nowrap">
                   {item.alt}m Elevation
                 </span>
               )}
            </div>
            <p className="text-muted text-sm leading-relaxed">{item.activity}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
