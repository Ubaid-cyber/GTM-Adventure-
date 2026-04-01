import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import TrekCommandCenterClient from './TrekCommandCenterClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Command Center | GTM-Adventure',
  description: 'Real-time trek tracking and progress monitoring.',
};

export default async function ExpeditionCommandCenterPage({ params }: { params: { id: string } }) {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/login');
  }

  const { id } = await params;

  return <TrekCommandCenterClient expeditionId={id} />;
}
