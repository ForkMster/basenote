import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Geist, Geist_Mono } from 'geist/font';

const geistSans = Geist({ subsets: ['latin'] });
const geistMono = Geist_Mono({ subsets: ['latin'] });

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}