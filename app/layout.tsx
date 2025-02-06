import './globals.css';
import { Space_Grotesk } from 'next/font/google';
import Navigation from '@/components/Navigation';
import { ThemeProvider } from './providers';
import { Toaster } from 'react-hot-toast';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700']
});

export const metadata = {
  title: 'Sequence - AI Yoga Sequence Generator',
  description: 'Generate personalized yoga sequences with AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${spaceGrotesk.className} min-h-full antialiased selection:bg-purple-500/30`}>
        <ThemeProvider>
          <div className="fixed inset-0 grid-background" />
          <Navigation />
          <main className="relative pt-16">
            {children}
          </main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'brutalist-card',
              duration: 5000,
              style: {
                background: 'var(--card)',
                color: 'var(--card-foreground)',
                border: '2px solid var(--border)',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
} 