import type { Metadata } from 'next';
import './globals.css';
import '@/styles/crt.css';
import { MusicProvider } from '@/lib/audio/MusicProvider';
import { MusicController } from '@/components/shared/MusicController';

export const metadata: Metadata = {
  title: 'Noghurt Brain',
  description: 'Multiplayer trivia. Cyberpunk vibes. Bring your phone.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <MusicProvider>
          {children}
          <MusicController />
        </MusicProvider>
      </body>
    </html>
  );
}
