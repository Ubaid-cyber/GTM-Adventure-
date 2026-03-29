import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MissionControlClient from './MissionControlClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mission Control | GTM-Adventure',
  description: 'Real-time expedition tracking and telemetry.',
};

export default async function MissionControlPage({ params }: { params: { id: string } }) {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/login');
  }

  const expeditionId = (await params).id;

  return <MissionControlClient expeditionId={expeditionId} />;
}
