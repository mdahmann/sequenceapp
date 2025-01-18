'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setIsLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-gray-900/50 border-b border-white/10">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Sequence
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              href="/poses"
              className={`text-sm ${
                pathname === '/poses'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white transition-colors'
              }`}
            >
              Poses
            </Link>
            <Link
              href="/generate"
              className={`text-sm ${
                pathname === '/generate'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white transition-colors'
              }`}
            >
              Generate Sequence
            </Link>
            
            {user ? (
              <>
                <Link
                  href="/saved"
                  className={`text-sm ${
                    pathname === '/saved'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white transition-colors'
                  }`}
                >
                  Saved Sequences
                </Link>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                  }}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : !isLoading && (
              <>
                <Link
                  href="/login"
                  className={`text-sm ${
                    pathname === '/login'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white transition-colors'
                  }`}
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className={`text-sm ${
                    pathname === '/signup'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white transition-colors'
                  }`}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="border-t border-white/10 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Sequence. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 