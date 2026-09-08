import type { Metadata } from 'next';
import LearnLanding from '../components/learn/LearnLanding';
import { siteIcons } from '../../lib/siteIcons';

const courseJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'AI Training Foundations',
  description:
    'Learn the foundations of AI training, practice evaluating AI responses, complete a readiness assessment, and earn a certificate of completion.',
  provider: { '@type': 'Organization', name: 'AITrainers.coach', url: 'https://aitrainers.coach' },
  isAccessibleForFree: true,
  educationalCredentialAwarded: 'Certificate of Completion',
};

export const metadata: Metadata = {
  title: 'Free AI Training Foundations Course | AITrainers.coach',
  description:
    'Learn the foundations of AI training, practice evaluating AI responses, complete a readiness assessment, and earn a certificate of completion.',
  icons: siteIcons,
  openGraph: {
    title: 'AI Training Foundations',
    description: 'A free beginner course to learn, practice, and earn a certificate of completion.',
  },
};

export default function LearnPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }} />
      <LearnLanding />
    </>
  );
}
