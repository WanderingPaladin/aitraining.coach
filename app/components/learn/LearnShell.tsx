import SiteFooter from '../SiteFooter';
import SiteHeader from '../SiteHeader';

export default function LearnShell({
  children,
  hero,
  footer = true,
}: {
  children: React.ReactNode;
  hero?: React.ReactNode;
  footer?: boolean;
}) {
  return (
    <main className="journal-page learn-page" id="top">
      <div className="journal-hero-wrap learn-hero-wrap">
        <SiteHeader current="learn" />
        {hero}
      </div>
      {children}
      {footer ? <SiteFooter /> : null}
    </main>
  );
}
