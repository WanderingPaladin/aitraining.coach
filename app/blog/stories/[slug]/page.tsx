import { redirect } from 'next/navigation';

type LegacyStoryRedirectProps = {
  params: Promise<{ slug: string }>;
};

export default async function LegacyStoryRedirect({ params }: LegacyStoryRedirectProps) {
  const { slug } = await params;
  redirect(`/stories/${slug}`);
}
