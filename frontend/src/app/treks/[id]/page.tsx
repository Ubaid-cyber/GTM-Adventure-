import TrekDetailClient from './TrekDetailClient';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const trek = await prisma.trek.findUnique({ where: { id } });
  return {
    title: trek ? `${trek.title} | GTM-Adventure` : 'Trek Details | GTM-Adventure',
    description: trek?.description?.substring(0, 160) || 'Discover amazing Himalayan treks.',
  };
}

export default async function TrekPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TrekDetailClient id={id} />;
}
