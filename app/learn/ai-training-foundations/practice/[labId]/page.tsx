import type { Metadata } from 'next';
import PracticeLab from '../../../../components/learn/PracticeLab';
import { siteIcons } from '../../../../../lib/siteIcons';

export async function generateMetadata({ params }: { params: Promise<{ labId: string }> }): Promise<Metadata> {
  const { labId } = await params;
  return {
    title: `Practice: ${labId} | AI Training Foundations`,
    description: 'Optional AI evaluation practice lab.',
    icons: siteIcons,
  };
}

export default async function PracticeLabPage({ params }: { params: Promise<{ labId: string }> }) {
  const { labId } = await params;
  return <PracticeLab labId={labId} />;
}
