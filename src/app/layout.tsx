import type { Metadata } from 'next';
import '@/styles/globals.css';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import StarBackground from '@/components/common/StarBackground';
import ToastContainer from '@/components/common/Toast';

export const metadata: Metadata = {
  title: 'YŪGENIME — Beyond Every World, A Story Awaits',
  description: 'Immersive Fantasy Anime Discovery & Streaming Platform. Jelajahi berbagai dunia cerita anime dengan estetika editorial modern, pemutar modular, dan katalog terlengkap.',
  keywords: ['anime', 'streaming anime', 'anime discovery', 'fantasy anime', 'yugenime', 'sub indo'],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#090911',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <StarBackground />
        <Navbar />
        <main style={{ minHeight: '85vh', position: 'relative', zIndex: 1 }}>
          {children}
        </main>
        <Footer />
        <ToastContainer />
      </body>
    </html>
  );
}
