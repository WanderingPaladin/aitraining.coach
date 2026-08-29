import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: 'AI Trainers — Become an AI Training Expert',
  description: 'Coaching, guidance, and real opportunities for people building careers as AI trainers.',
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
      <body>{children}</body>
    </html>
  );
}
