import { MedicalDashboard } from '../../components/MedicalDashboard';

export const metadata = {
  title: 'Medical Clearance · GTM Adventures',
  description: 'Review and approve trekker medical clearance records.',
  robots: { index: false, follow: false },
};

export default function MedicalReviewPage() {
  return <MedicalDashboard />;
}
