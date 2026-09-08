import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LearnShell from '../../../../components/learn/LearnShell';
import ModuleView from '../../../../components/learn/ModuleView';
import { MODULES } from '../../../../../lib/learn/course';
import { siteIcons } from '../../../../../lib/siteIcons';

export function generateStaticParams() {
  return MODULES.map((item) => ({ n: String(item.n) }));
}

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const { n } = await params;
  const module = MODULES.find((item) => String(item.n) === n);
  return {
    title: module ? `${module.title} | AI Training Foundations` : 'Module | AI Training Foundations',
    description: 'A short, interactive lesson from the free AI Training Foundations course.',
    icons: siteIcons,
  };
}

export default async function ModulePage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const num = Number(n);
  if (!MODULES.some((item) => item.n === num)) notFound();
  return (
    <LearnShell>
      <div className="journal-light">
        <div className="shell journal-main">
          <ModuleView n={num} />
        </div>
      </div>
    </LearnShell>
  );
}
