import { redirect } from 'next/navigation';

export default function LegacyStoriesRedirect() {
  redirect('/stories');
}
