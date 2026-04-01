import React from 'react';
import DashboardClient from './DashboardClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Executive Dashboard | GTM-Adventure',
  description: 'GTM-Adventure Enterprise Operational HUD',
};

export default function AdventureDashboard() {
  return <DashboardClient />;
}
