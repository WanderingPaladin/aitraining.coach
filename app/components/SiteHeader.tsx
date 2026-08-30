import { ArrowUpRight } from 'lucide-react';
import Brand from './Brand';

export type NavCurrent = 'home' | 'how' | 'stories' | 'blog' | 'faq';

const links: Array<{ id: NavCurrent; label: string; homeHref: string; href: string; offPage?: boolean }> = [
  { id: 'home', label: 'Home', homeHref: '#top', href: '/' },
  { id: 'how', label: 'How It Works', homeHref: '#how', href: '/#how' },
  { id: 'faq', label: 'FAQ', homeHref: '#faq', href: '/#faq' },
  { id: 'stories', label: 'Stories', homeHref: '/stories', href: '/stories', offPage: true },
];

export default function SiteHeader({
  current = 'home',
  home = false,
}: {
  current?: NavCurrent;
  home?: boolean;
}) {
  return (
    <header className="site-header shell">
      <Brand href={home ? '#top' : '/'} />
      <nav aria-label="Main navigation">
        {links.map((link) => (
          <a
            key={link.id}
            className={current === link.id ? 'current' : undefined}
            href={home ? link.homeHref : link.href}
          >
            {link.label}
            {link.offPage ? (
              <ArrowUpRight className="nav-offpage-icon" size={13} strokeWidth={2.25} aria-hidden="true" />
            ) : null}
          </a>
        ))}
      </nav>
      <a className="mini-cta" href={home ? '#apply' : '/#apply'}>Book a Free Intro Call</a>
    </header>
  );
}
