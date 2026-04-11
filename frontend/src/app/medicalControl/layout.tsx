import MedicalLayout from '@/components/medical/MedicalLayout';

export const metadata = {
  title: 'Medical Panel · GTM Adventures',
  description: 'Professional health management and trekker clearance panel.',
  robots: { index: false, follow: false },
};

export default function RootMedicalLayout({ children }: { children: React.ReactNode }) {
  return <MedicalLayout>{children}</MedicalLayout>;
}
