import type { Metadata } from 'next';
import AssessmentClient from '../../../components/learn/AssessmentClient';
import LearnShell from '../../../components/learn/LearnShell';
import { siteIcons } from '../../../../lib/siteIcons';

export const metadata: Metadata = {
  title: 'Foundations Assessment | AITrainers.coach',
  description: 'Complete the AI Training Foundations readiness assessment.',
  icons: siteIcons,
  robots: { index: false, follow: false },
};

export default function AssessmentPage() {
  return (
    <LearnShell>
      <div className="journal-light">
        <div className="shell journal-main">
          <AssessmentClient />
        </div>
      </div>
    </LearnShell>
  );
}
