'use client';

export default function SaveToast({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <p className="learn-toast" role="status" aria-live="polite">
      Progress saved
    </p>
  );
}
