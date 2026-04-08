import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
import { Metadata } from 'next';
import jwt from 'jsonwebtoken';

export const metadata: Metadata = {
  title: 'Executive Dashboard | GTM-Adventure',
  description: 'GTM-Adventure Enterprise Operational HUD',
};

export default async function AdventureDashboard() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect('/login');
  }

  // 🛡️ ROLE-BASED ACCESS CONTROL
  const role = (session.user as any).role || 'TREKKER';
  
  if (role === 'ADMIN') {
    redirect('/adminControl'); // INSTANT SERVER-SIDE REDIRECT FOR ADMINS
  }
  
  if (role === 'TREKKER') {
    redirect('/dashboard/bookings'); // Direct to user-specific content
  }

  // 🛡️ SECURE MISSION CLEARANCE
  const secret = process.env.NEXTAUTH_SECRET || 'development_secret_only';
  const apiToken = jwt.sign(
    { email: session.user.email, exp: Math.floor(Date.now() / 1000) + 3600 },
    secret
  );

  return <DashboardClient apiToken={apiToken} isLeader={role === 'LEADER'} />;
}
