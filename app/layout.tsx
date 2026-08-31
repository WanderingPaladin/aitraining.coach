import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import { siteIcons } from '../lib/siteIcons';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: 'AI Trainers — Become an AI Training Expert',
  description: 'Coaching, guidance, and real opportunities for people building careers as AI trainers.',
  icons: siteIcons,
  openGraph: {
    title: 'Become an AI Training Expert',
    description: 'Coaching, guidance, and real opportunities.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Become an AI Training Expert',
    description: 'Coaching, guidance, and real opportunities.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={manrope.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
      </head>
      <body>{children}</body>
    </html>
  );
}
