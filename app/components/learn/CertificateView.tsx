'use client';

import { useEffect, useState } from 'react';
import { downloadCertificatePdf, fetchPublicCertificate } from '../../../lib/learn/api';
import { trackEvent } from '../../../lib/tracking';

export default function CertificateView({ credentialId }: { credentialId: string }) {
  const [data, setData] = useState<{
    credentialId: string;
    course: string;
    issuedTo: string;
    issuedAt: string;
    status: string;
    assessment: string;
    score: number | null;
  } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPublicCertificate(credentialId)
      .then((result) => setData(result.certificate))
      .catch(() => setError('This credential could not be verified.'));
  }, [credentialId]);

  if (error) return <p className="learn-empty" role="alert">{error}</p>;
  if (!data) return <p className="learn-status">Verifying credential…</p>;

  const issued = new Date(data.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  async function download() {
    const blob = await downloadCertificatePdf(credentialId);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${credentialId}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
    trackEvent({ eventType: 'certificate_downloaded' });
  }

  return (
    <article className="learn-certificate">
      <p className="learn-kicker">Verified credential</p>
      <h1>AI Training Foundations</h1>
      <p className="learn-lead">Certificate of Completion</p>
      <dl className="learn-cert-meta">
        <div><dt>Issued to</dt><dd>{data.issuedTo}</dd></div>
        <div><dt>Issued</dt><dd>{issued}</dd></div>
        <div><dt>Assessment</dt><dd>{data.assessment}</dd></div>
        {data.score != null ? (
          <div><dt>Score</dt><dd>{data.score}/100</dd></div>
        ) : null}
        <div><dt>Status</dt><dd>{data.status}</dd></div>
        <div><dt>Credential ID</dt><dd>{data.credentialId}</dd></div>
      </dl>
      <div className="learn-pager">
        <button type="button" className="primary-button" onClick={() => void download()}>
          Download certificate
        </button>
        <button
          type="button"
          className="secondary-button on-light"
          onClick={() => {
            if (shareUrl && navigator.share) void navigator.share({ title: 'AI Training Foundations', url: shareUrl });
            else if (shareUrl) void navigator.clipboard.writeText(shareUrl);
          }}
        >
          Share credential
        </button>
      </div>
      <p className="learn-disclaimer">
        This credential confirms that the learner completed the AITrainers.coach AI Training Foundations educational program and met its internal assessment requirement. It does not guarantee third-party employment or platform acceptance.
      </p>
    </article>
  );
}
