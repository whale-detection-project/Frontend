import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/ui/header';
import { Providers } from './providers';
import { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Whale-Detector',
  description: '대규모 비트코인 거래를 탐지하고 AI 기반 인사이트를 제공합니다.',
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground`}>
        <Providers>
          <Header />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
