import { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: "GTM Adventures | Elite Himalayan Trek Booking & Expeditions",
  description: "Book your next Himalayan adventure with GTM Adventures. Expert-led treks to Everest Base Camp, Annapurna, and more with industry-leading safety protocols.",
  openGraph: {
    title: "GTM Adventures | Elite Himalayan Trek Booking",
    description: "Experience the Himalayas with unparalleled safety. World-class treks led by expert guides.",
    images: ["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200"],
  },
};

export default function HomePage() {
  return <HomeClient />;
}
