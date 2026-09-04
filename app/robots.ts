import type { MetadataRoute } from 'next';
import { siteOrigin } from '../lib/api';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/login', '/register', '/profile', '/profile/edit', '/forgot-password', '/reset-password', '/verify-email'],
    },
    sitemap: `${siteOrigin()}/sitemap.xml`,
  };
}
