import type { Metadata } from 'next';
import PracticeHub from '../../../components/learn/PracticeHub';
import { siteIcons } from '../../../../lib/siteIcons';

export const metadata: Metadata = {
  title: 'Practice Labs | AI Training Foundations',
  description: 'Optional AI evaluation practice labs. They do not affect your certificate score.',
  icons: siteIcons,
};

export default function PracticePage() {
  return <PracticeHub />;
}
