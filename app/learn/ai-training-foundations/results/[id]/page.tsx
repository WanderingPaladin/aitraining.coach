import type { Metadata } from 'next';
import LearnShell from '../../../../components/learn/LearnShell';
import ResultsView from '../../../../components/learn/ResultsView';
import { siteIcons } from '../../../../../lib/siteIcons';

export const metadata: Metadata = {
  title: 'Your Foundations Results | AITrainers.coach',
  description: 'Your AI Training Foundations readiness score and next steps.',
  icons: siteIcons,
  robots: { index: false, follow: false },
};

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <LearnShell>
      <div className="journal-light">
        <div className="shell journal-main">
          <ResultsView attemptId={id} />
        </div>
      </div>
    </LearnShell>
  );
}
