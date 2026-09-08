import type { Metadata } from 'next';
import CourseDashboard from '../../components/learn/CourseDashboard';
import LearnShell from '../../components/learn/LearnShell';
import { siteIcons } from '../../../lib/siteIcons';

export const metadata: Metadata = {
  title: 'AI Training Foundations | AITrainers.coach',
  description: 'Continue the free AI Training Foundations course, track your modules, and take the readiness assessment.',
  icons: siteIcons,
};

export default function CoursePage() {
  return (
    <LearnShell>
      <div className="journal-light">
        <div className="shell journal-main">
          <CourseDashboard />
        </div>
      </div>
    </LearnShell>
  );
}
