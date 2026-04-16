import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import BookingsClient from './BookingsClient';
import { Metadata } from 'next';
import { getUserBookingsAction } from '@/lib/actions/booking-actions';

export const metadata: Metadata = {
  title: 'My Bookings | GTM-Adventure',
  description: 'View your upcoming and past Himalayan trek bookings.',
};

export default async function BookingsPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/login');
  }

  // Fetch data on server for better performance
  const initialBookings = await getUserBookingsAction();

  return <BookingsClient initialBookings={initialBookings} />;
}
