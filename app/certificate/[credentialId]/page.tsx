import type { Metadata } from 'next';
import CertificateView from '../../components/learn/CertificateView';
import LearnShell from '../../components/learn/LearnShell';
import { siteIcons } from '../../../lib/siteIcons';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ credentialId: string }>;
}): Promise<Metadata> {
  const { credentialId } = await params;
  return {
    title: `Verified Credential ${credentialId} | AITrainers.coach`,
    description: 'Verify an AI Training Foundations Certificate of Completion issued by AITrainers.coach.',
    icons: siteIcons,
  };
}

export default async function CertificatePage({ params }: { params: Promise<{ credentialId: string }> }) {
  const { credentialId } = await params;
  return (
    <LearnShell>
      <div className="journal-light">
        <div className="shell journal-main">
          <CertificateView credentialId={credentialId} />
        </div>
      </div>
    </LearnShell>
  );
}
