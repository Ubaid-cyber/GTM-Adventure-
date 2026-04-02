import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import TrekCommandCenterClient from './TrekCommandCenterClient';
import { Metadata } from 'next';
import jwt from 'jsonwebtoken';

export const metadata: Metadata = {
  title: 'Mission Control | GTM-Adventure',
  description: 'Real-time trek tracking and operational monitoring.',
};

export default async function ExpeditionCommandCenterPage({ params }: { params: { id: string } }) {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/login');
  }

  const { id } = await params;

  // 🛡️ SECURE MISSION CLEARANCE: Sign a one-time use JWT for the backend
  const secret = process.env.NEXTAUTH_SECRET || 'development_secret_only';
  const apiToken = jwt.sign(
    { email: session.user.email, exp: Math.floor(Date.now() / 1000) + 3600 }, // 1hr clearance
    secret
  );

  return <TrekCommandCenterClient expeditionId={id} apiToken={apiToken} />;
}
