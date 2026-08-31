'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { GraduationCap, ShieldCheck, TrendingUp, type LucideIcon } from 'lucide-react';
import FeatureIcon from './FeatureIcon';

const benefits: Array<{
  icon: LucideIcon;
  iconClassName: string;
  text: ReactNode;
}> = [
  {
    icon: ShieldCheck,
    iconClassName: 'text-[#14C7E5]',
    text: (
      <>
        No prior AI training<br />experience needed
      </>
    ),
  },
  {
    icon: GraduationCap,
    iconClassName: 'text-[#1687FF]',
    text: (
      <>
        Step-by-step<br />expert coaching
      </>
    ),
  },
  {
    icon: TrendingUp,
    iconClassName: 'text-[#A855F7]',
    text: (
      <>
        Build a clearer<br />path forward
      </>
    ),
  },
];

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function HeroBenefitRail() {
  const railRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [active, setActive] = useState(0);

  const syncActive = useCallback(() => {
    const rail = railRef.current;
    if (!rail) {
      return;
    }
    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    cardRefs.current.forEach((card, index) => {
      if (!card) {
        return;
      }
      const dist = Math.abs(card.offsetLeft - rail.scrollLeft);
      if (dist < bestDist) {
        bestDist = dist;
        best = index;
      }
    });
    setActive(best);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) {
      return;
    }
    const onScroll = () => {
      syncActive();
    };
    rail.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', syncActive);
    syncActive();
    return () => {
      rail.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', syncActive);
    };
  }, [syncActive]);

  function scrollToCard(index: number) {
    const rail = railRef.current;
    const card = cardRefs.current[index];
    if (!rail || !card) {
      return;
    }
    rail.scrollTo({
      left: card.offsetLeft,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }

  return (
    <div className="hero-benefit-rail">
      <div ref={railRef} className="benefit-chips" aria-label="AI Trainers benefits">
        {benefits.map((benefit, index) => (
          <span
            key={index}
            ref={(node) => {
              cardRefs.current[index] = node;
            }}
          >
            <FeatureIcon
              icon={benefit.icon}
              variant="dark"
              size={22}
              tileSize={36}
              iconClassName={benefit.iconClassName}
            />
            <span className="benefit-chip-copy">{benefit.text}</span>
          </span>
        ))}
      </div>
      <div className="benefit-rail-indicators" role="group" aria-label="Benefit cards">
        {benefits.map((_, index) => (
          <button
            key={index}
            type="button"
            className={index === active ? 'is-active' : undefined}
            aria-label={`View benefit ${index + 1}`}
            aria-current={index === active ? 'true' : undefined}
            onClick={() => scrollToCard(index)}
          />
        ))}
      </div>
    </div>
  );
}
