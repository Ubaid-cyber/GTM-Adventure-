import MedicalLayout from '@/components/medical/MedicalLayout';

export const metadata = {
  title: 'Medical HQ · GTM Adventures',
  description: 'Mission-critical health oversight and trekker clearance node.',
  robots: { index: false, follow: false },
};

export default function RootMedicalLayout({ children }: { children: React.ReactNode }) {
  return <MedicalLayout>{children}</MedicalLayout>;
}
