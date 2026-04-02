'use client';

import React from 'react';
import { MedicalDashboard } from '../../components/MedicalDashboard';

export default function MedicalReviewPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-cyan-500/10 py-12 px-6 lg:px-12">
      <div className="max-w-[1700px] mx-auto">
        {/* MODULAR MEDICAL TELEMETRY */}
        <MedicalDashboard />
      </div>
    </div>
  );
}
