import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  name: string;
  value: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  growth?: string;
  growthColor?: string;
  description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  name,
  value,
  icon: Icon,
  color,
  bg,
  growth,
  growthColor = 'text-green-500',
  description
}) => {
  return (
    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[24px] group hover:border-blue-500/30 transition-all duration-500 shadow-xl">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${bg}`}>
          <Icon className={`w-5 h-5 ${color} group-hover:scale-110 transition-transform`} />
        </div>
        {growth && (
          <div className={`flex items-center gap-1 ${growthColor} text-[9px] font-bold tracking-widest bg-white/5 px-2 py-1 rounded-full border border-white/5`}>
            {growth.includes('%') && !growth.includes('-') && <ArrowUpRight className="w-3 h-3" />}
            {growth.includes('%') && growth.includes('-') && <ArrowDownRight className="w-3 h-3" />}
            {growth}
          </div>
        )}
      </div>
      <div className="space-y-1 text-left">
        <h3 className="text-white/30 text-[10px] font-black uppercase tracking-widest">{name}</h3>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        {description && (
          <p className="text-[10px] text-white/20 font-medium tracking-tight mt-2 italic">{description}</p>
        )}
      </div>
    </div>
  );
};
