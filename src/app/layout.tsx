import type { Metadata } from 'next';
import { Alegreya, Belleza } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseProvider } from '@/context/FirebaseContext'; // Will create this

const belleza = Belleza({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-belleza',
});

const alegreya = Alegreya({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-alegreya',
});

export const metadata: Metadata = {
  title: 'Pebble Pits - Ajua Game',
  description: 'Play the traditional East African board game Ajua (Mancala) online.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${belleza.variable} ${alegreya.variable}`}>
      <head>
        {/* Next/font handles font loading automatically */}
      </head>
      <body className="font-body antialiased" suppressHydrationWarning={true}>
        <FirebaseProvider>
          {children}
          <Toaster />
        </FirebaseProvider>
      </body>
    </html>
  );
}
