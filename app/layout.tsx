import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
