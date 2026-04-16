import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getMedicalProfileAction } from '@/lib/actions/health-actions';
import HealthClient from './HealthClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Medical Passport | GTM-Adventure',
  description: 'Manage your health information for safe Himalayan trekking.',
};

export default async function HealthPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/login');
  }

  // Fetch medical profile on the server to prevent UI lag
  const result = await getMedicalProfileAction();
  const initialProfile = result.success ? result.profile : null;

  return (
    <HealthClient 
      session={session} 
      initialProfile={initialProfile as any} 
    />
  );
}
