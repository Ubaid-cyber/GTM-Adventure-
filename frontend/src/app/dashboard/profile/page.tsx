import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserBookingsAction } from '@/lib/actions/booking-actions';
import ProfileClient from './ProfileClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Profile | GTM-Adventure',
  description: 'View your Himalayan trekker profile and adventure history.',
};

export default async function UserProfilePage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/login');
  }

  // Fetch data on the server to prevent "waterfall" lag
  const initialBookings = await getUserBookingsAction();

  return (
    <ProfileClient 
      session={session} 
      initialBookings={initialBookings} 
    />
  );
}
