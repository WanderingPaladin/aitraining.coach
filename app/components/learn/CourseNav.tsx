'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function CourseNav({
  back,
  primary,
}: {
  back: { href: string; label: string };
  primary?: {
    href?: string;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit';
    id?: string;
  } | null;
}) {
  return (
    <nav className="learn-course-nav" aria-label="Course navigation">
      <a className="secondary-button on-light learn-course-nav-back" href={back.href}>
        <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
        {back.label.replace(/^←\s*/, '')}
      </a>
      {primary?.href ? (
        <a id={primary.id} className="primary-button" href={primary.href} onClick={primary.onClick}>
          {primary.label.replace(/\s*→$/, '')}
          <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
        </a>
      ) : primary ? (
        <button
          id={primary.id}
          type={primary.type ?? 'button'}
          className="primary-button"
          onClick={primary.onClick}
          disabled={primary.disabled}
        >
          {primary.label.replace(/\s*→$/, '')}
          {primary.label.includes('→') ? <ArrowRight size={16} strokeWidth={2} aria-hidden="true" /> : null}
        </button>
      ) : null}
    </nav>
  );
}
