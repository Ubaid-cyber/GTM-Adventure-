import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import TrekBasecampClient from './TrekBasecampClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trek Dashboard | GTM-Adventure',
  description: 'Real-time trek tracking and progress monitoring.',
};

export default async function ExpeditionBasecampPage({ params }: { params: { id: string } }) {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/login');
  }

  const { id } = await params;

  return <TrekBasecampClient expeditionId={id} />;
}
