'use client';

import { useCallback, useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type TouchEvent } from 'react';

const SLIDE_MS = 6000;
const EXIT_MS = 700;

type HeadlinePart = { text: string; highlight?: boolean };

type HeroSlide = {
  id: number;
  headlineLines: HeadlinePart[][];
  body: string;
};

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    headlineLines: [
      [{ text: 'No Experience?' }],
      [{ text: 'You’re Still in the Right Place.', highlight: true }],
    ],
    body: 'If you can create accounts on supported AI-training platforms, prior AI-training experience is not required. Our coaches work closely with you through onboarding, hands-on practice, project strategy, and your first real opportunities — so you’re never left to figure it out alone.',
  },
  {
    id: 2,
    headlineLines: [
      [{ text: 'Your Expertise Could Be' }],
      [{ text: 'Your Edge in AI Training.', highlight: true }],
    ],
    body: 'Software, finance, law, writing, science, research and more — the knowledge you already have can be valuable in AI training. We help you understand where your experience fits and how to turn it into a real path forward.',
  },
  {
    id: 3,
    headlineLines: [
      [{ text: 'New to AI Training?' }],
      [
        { text: 'See What ' },
        { text: '4–8 Weeks', highlight: true },
        { text: ' Can Change.' },
      ],
    ],
    body: 'With focused coaching, hands-on practice, and a clear roadmap, newcomers can build the judgment, workflow, and confidence needed to approach AI-training work much more effectively.',
  },
  {
    id: 4,
    headlineLines: [
      [{ text: 'Start Your Journey.' }],
      [{ text: 'Pay After You Start Earning.', highlight: true }],
    ],
    body: 'Get the coaching and support you need without paying us upfront. Focus on building your skills and finding your path first — our fee begins only after you start earning from AI-training work.',
  },
  {
    id: 5,
    headlineLines: [
      [{ text: 'Turn What You Know Into' }],
      [{ text: 'A Clear AI Training Path.', highlight: true }],
    ],
    body: 'We combine structured coaching, practical guidance, and hands-on support to help you understand the work, strengthen the right skills, and move forward without having to figure everything out alone.',
  },
  {
    id: 6,
    headlineLines: [
      [{ text: 'Turn Inconsistent Progress Into' }],
      [{ text: 'Stronger Momentum.', highlight: true }],
    ],
    body: 'If unclear direction, inconsistent opportunities, or limited time are slowing you down, we help you sharpen your approach, work more effectively, and build a clearer way forward.',
  },
];

function SlideCopy({ slide, heading }: { slide: HeroSlide; heading: boolean }) {
  const TitleTag = heading ? 'h1' : 'p';

  return (
    <>
      <TitleTag className="hero-slide-title">
        {slide.headlineLines.map((line, lineIndex) => (
          <span key={lineIndex}>
            {lineIndex > 0 ? <br /> : null}
            {line.map((part, partIndex) =>
              part.highlight ? (
                <span key={partIndex} className="hero-hl">
                  {part.text}
                </span>
              ) : (
                <span key={partIndex}>{part.text}</span>
              ),
            )}
          </span>
        ))}
      </TitleTag>
      <p className="hero-slide-body">{slide.body}</p>
    </>
  );
}

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const [navFocused, setNavFocused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [hasRotated, setHasRotated] = useState(false);
  const leaveTimer = useRef<number>(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const indexRef = useRef(0);

  const paused = hovered || navFocused;
  const slideCount = heroSlides.length;
  indexRef.current = index;

  const restartProgress = useCallback(() => {
    setProgressKey((key) => key + 1);
  }, []);

  const goTo = useCallback(
    (nextIndex: number) => {
      const current = indexRef.current;
      const wrapped = (nextIndex + slideCount) % slideCount;
      if (wrapped !== current) {
        setLeaving(current);
        setHasRotated(true);
        setIndex(wrapped);
        window.clearTimeout(leaveTimer.current);
        leaveTimer.current = window.setTimeout(() => {
          setLeaving(null);
        }, EXIT_MS);
      }
      restartProgress();
    },
    [restartProgress, slideCount],
  );

  useEffect(() => {
    return () => window.clearTimeout(leaveTimer.current);
  }, []);

  useEffect(() => {
    if (paused) {
      return;
    }
    const timer = window.setTimeout(() => {
      goTo(index + 1);
    }, SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [goTo, index, paused, progressKey]);

  function onPointerLeave() {
    setHovered(false);
    restartProgress();
  }

  function onNavBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setNavFocused(false);
      restartProgress();
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(index + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(index - 1);
    }
  }

  function onTouchStart(event: TouchEvent<HTMLDivElement>) {
    const touch = event.changedTouches[0];
    if (!touch) {
      return;
    }
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }

  function onTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStart.current;
    const touch = event.changedTouches[0];
    touchStart.current = null;
    if (!start || !touch) {
      return;
    }
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) {
      return;
    }
    goTo(dx < 0 ? index + 1 : index - 1);
  }

  const current = heroSlides[index];
  const exiting = leaving !== null ? heroSlides[leaving] : null;

  if (!current) {
    return null;
  }

  return (
    <div
      className="hero-carousel"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onPointerLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="hero-carousel-stage" aria-live="off">
        {exiting && (
          <div className="hero-slide hero-slide-exit" aria-hidden="true">
            <SlideCopy slide={exiting} heading={false} />
          </div>
        )}
        <div className={hasRotated ? 'hero-slide hero-slide-enter' : 'hero-slide'}>
          <SlideCopy slide={current} heading />
        </div>
      </div>

      <div className="hero-progress">
        <p className="hero-progress-index" aria-live="polite">
          <span>{String(index + 1).padStart(2, '0')}</span>
          <span className="hero-progress-total"> / {String(slideCount).padStart(2, '0')}</span>
        </p>
        <div
          className="hero-progress-tabs"
          role="tablist"
          aria-label="Hero messages"
          onFocus={() => setNavFocused(true)}
          onBlur={onNavBlur}
          onKeyDown={onKeyDown}
        >
          {heroSlides.map((slide, slideIndex) => {
            const selected = slideIndex === index;
            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-label={`Go to hero message ${slide.id}`}
                aria-selected={selected}
                className={selected ? (paused ? 'is-active is-paused' : 'is-active') : undefined}
                onClick={() => goTo(slideIndex)}
              >
                <span className="hero-progress-track">
                  {selected && (
                    <span key={progressKey} className="hero-progress-fill" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
