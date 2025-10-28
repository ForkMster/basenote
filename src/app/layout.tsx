import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../../app/globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BaseNote - Farcaster & Base Mini App',
  description: 'Investment Tracker, Todo List, and Notes with NFT minting on Base',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}