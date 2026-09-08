import type { MetadataRoute } from 'next';
import { fetchJobSitemapServer, siteOrigin } from '../lib/api';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteOrigin();
  const jobs = await fetchJobSitemapServer();
  return [
    { url: `${origin}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${origin}/learn`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${origin}/learn/ai-training-foundations`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${origin}/stories`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${origin}/blog`, changeFrequency: 'weekly', priority: 0.5 },
    ...jobs.map((job) => ({
      url: `${origin}/opportunities/${job.slug}`,
      lastModified: job.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
  ];
}
