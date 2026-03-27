import TreksClient from './TreksClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Discover Treks | GTM-Adventure',
  description: 'Search and filter the best treks for your next adventure.',
  openGraph: {
    title: 'Discover Treks | GTM-Adventure',
    description: 'Search and filter the best treks for your next adventure.',
  }
};

export default function TreksPage() {
  return <TreksClient />;
}
