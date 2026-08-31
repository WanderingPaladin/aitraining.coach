import type { Metadata } from 'next';

export const siteIcons: NonNullable<Metadata['icons']> = {
  icon: [
    { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    { url: '/favicon.ico' },
  ],
  apple: [
    { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  ],
};
