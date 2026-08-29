import type { StoryIdentity } from '../../lib/stories';
import { Code2, GraduationCap, Landmark, PenLine, Search, TrendingUp, UserRound } from 'lucide-react';

const identityIcons = {
  newcomer: GraduationCap,
  anonymous: UserRound,
  finance: Landmark,
  research: Search,
  software: Code2,
  writer: PenLine,
  experienced: TrendingUp,
} as const;

export default function StoryIdentityMark({
  identity,
  size = 'md',
}: {
  identity: StoryIdentity;
  size?: 'sm' | 'md' | 'lg';
}) {
  const Icon = identityIcons[identity.kind];
  const iconSize = size === 'lg' ? 10 : 8;

  return (
    <span className={`journey-mark journey-mark-${size} journey-mark-${identity.kind}`} aria-hidden="true">
      <b>{identity.initials}</b>
      <span className="journey-mark-badge">
        <Icon size={iconSize} strokeWidth={2.4} />
      </span>
    </span>
  );
}
