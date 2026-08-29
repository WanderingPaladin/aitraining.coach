import Brand from './Brand';

export type NavCurrent = 'home' | 'how' | 'stories' | 'blog' | 'faq' | 'apply';

const links: Array<{ id: NavCurrent; label: string; homeHref: string; href: string }> = [
  { id: 'home', label: 'Home', homeHref: '#top', href: '/' },
  { id: 'how', label: 'How It Works', homeHref: '#how', href: '/#how' },
  { id: 'stories', label: 'Stories', homeHref: '/stories', href: '/stories' },
  { id: 'faq', label: 'FAQ', homeHref: '#faq', href: '/#faq' },
  { id: 'apply', label: 'Apply', homeHref: '#apply', href: '/#apply' },
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
          </a>
        ))}
      </nav>
      <a className="mini-cta" href={home ? '#apply' : '/#apply'}>Book a Free Intro Call</a>
    </header>
  );
}
