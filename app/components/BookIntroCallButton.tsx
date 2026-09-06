'use client';

import { ArrowRight, Phone } from 'lucide-react';
import { trackEvent } from '../../lib/tracking';

export default function BookIntroCallButton({
  href,
  className = 'primary-button',
}: {
  href: string;
  className?: string;
}) {
  return (
    <a
      className={className}
      href={href}
      onClick={() => trackEvent({ eventType: 'hero_cta_clicked', metadata: { href } })}
    >
      <Phone className="btn-icon-lead" size={18} strokeWidth={2} />
      Book a Free Intro Call
      <ArrowRight className="btn-icon" size={18} strokeWidth={2} />
    </a>
  );
}
