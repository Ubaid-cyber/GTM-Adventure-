import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import TrekCommandCenterClient from './TrekCommandCenterClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trip HQ | GTM-Adventure',
  description: 'Real-time trek tracking and operational monitoring.',
};

export default async function ExpeditionCommandCenterPage({ params }: { params: { id: string } }) {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/login');
  }

  const { id } = await params;
  const role = (session.user as any).role || 'TREKKER';
  const isLeader = role === 'LEADER' || role === 'ADMIN';

  return <TrekCommandCenterClient expeditionId={id} isLeader={isLeader} />;
}
