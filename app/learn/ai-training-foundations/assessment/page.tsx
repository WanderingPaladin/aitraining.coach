import type { Metadata } from 'next';
import AssessmentClient from '../../../components/learn/AssessmentClient';
import { siteIcons } from '../../../../lib/siteIcons';

export const metadata: Metadata = {
  title: 'Foundations Assessment | AITrainers.coach',
  description: 'Complete the AI Training Foundations readiness assessment.',
  icons: siteIcons,
  robots: { index: false, follow: false },
};

export default function AssessmentPage() {
  return (
    <div className="journal-page">
      <AssessmentClient />
    </div>
  );
}
