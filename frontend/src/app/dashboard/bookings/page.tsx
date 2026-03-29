import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import BookingsClient from './BookingsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Bookings | GTM-Adventure',
  description: 'View your upcoming and past Himalayan trek bookings.',
};

export default async function BookingsPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/login');
  }

  return <BookingsClient />;
}
