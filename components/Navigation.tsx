'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/app/providers';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

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

  const getMenuItems = () => {
    const items = [
      { name: 'Generate', href: '/generate' },
      { name: 'Discover', href: '/discover' },
      { name: 'Poses', href: '/poses' },
    ];

    if (user) {
      items.push(
        { name: 'Sequences', href: '/saved' },
        { name: 'Account', href: '/account' }
      );
    } else if (!isLoading) {
      items.push({ name: 'Sign Up', href: '/signup' });
    }

    return items;
  };

  const isActive = (path: string) => pathname === path;
  const menuItems = getMenuItems();

  const handleSignOut = async () => {
    try {
      console.log('Starting sign out process...');
      
      // First clear any local state
      setUser(null);
      
      // Sign out from Supabase and clear session
      const { error } = await supabase.auth.signOut({
        scope: 'global'
      });
      console.log('Supabase sign out completed', error || 'successfully');
      
      if (error) throw error;
      
      // Force a hard refresh to clear all state
      console.log('Redirecting to home page...');
      window.location.href = '/';
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 backdrop-blur-xl">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <motion.span 
              className="text-2xl font-bold tracking-tight transition-colors relative"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sequence
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </motion.span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative px-4 py-2 text-sm font-medium transition-colors group"
              >
                <span className={`relative z-10 ${
                  isActive(item.href)
                    ? 'text-primary font-bold'
                    : 'text-muted-foreground group-hover:text-foreground'
                }`}>
                  {item.name}
                </span>
                {isActive(item.href) && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute inset-0 bg-primary/10 rounded-lg"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {!isActive(item.href) && (
                  <div className="absolute inset-0 bg-primary/0 rounded-lg transition-colors group-hover:bg-primary/5" />
                )}
              </Link>
            ))}
            {!isLoading && !user && (
              <Link
                href="/login"
                className="relative ml-2 px-6 py-2 text-sm font-medium overflow-hidden group"
              >
                <span className="relative z-10 text-background">Log in</span>
                <motion.div 
                  className="absolute inset-0 bg-foreground"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                />
              </Link>
            )}
            {!isLoading && user && (
              <motion.button
                onClick={handleSignOut}
                className="relative ml-2 px-6 py-2 text-sm font-medium border border-border/10 overflow-hidden group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 group-hover:text-background transition-colors">Sign out</span>
                <div className="absolute inset-0 bg-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </motion.button>
            )}
            <motion.button
              onClick={toggleTheme}
              className="ml-4 p-2 hover:text-primary transition-colors relative group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle theme"
            >
              <span className="relative z-10">
                {theme === 'dark' ? (
                  <SunIcon className="w-5 h-5" />
                ) : (
                  <MoonIcon className="w-5 h-5" />
                )}
              </span>
              <div className="absolute inset-0 bg-primary/0 rounded-full transition-colors group-hover:bg-primary/10" />
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <motion.button
              onClick={toggleTheme}
              className="p-2 hover:text-primary transition-colors relative group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle theme"
            >
              <span className="relative z-10">
                {theme === 'dark' ? (
                  <SunIcon className="w-5 h-5" />
                ) : (
                  <MoonIcon className="w-5 h-5" />
                )}
              </span>
              <div className="absolute inset-0 bg-primary/0 rounded-full transition-colors group-hover:bg-primary/10" />
            </motion.button>
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-muted-foreground hover:text-foreground relative group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
              <div className="absolute inset-0 bg-primary/0 rounded-full transition-colors group-hover:bg-primary/10" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="md:hidden border-t border-border/10 bg-background/90 backdrop-blur-xl"
          >
            <div className="container mx-auto px-6 py-4 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="relative block px-4 py-2 text-sm font-medium transition-colors group"
                >
                  <span className={`relative z-10 ${
                    isActive(item.href)
                      ? 'text-primary font-bold'
                      : 'text-muted-foreground group-hover:text-foreground'
                  }`}>
                    {item.name}
                  </span>
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="mobileActiveIndicator"
                      className="absolute inset-0 bg-primary/10 rounded-lg"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {!isActive(item.href) && (
                    <div className="absolute inset-0 bg-primary/0 rounded-lg transition-colors group-hover:bg-primary/5" />
                  )}
                </Link>
              ))}
              {!isLoading && !user && (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full px-4 py-2 mt-2 text-sm font-medium bg-foreground text-background hover:bg-primary hover:text-white transition-colors"
                >
                  Log in
                </Link>
              )}
              {!isLoading && user && (
                <button
                  onClick={async () => {
                    await handleSignOut();
                    setIsOpen(false);
                  }}
                  className="block w-full px-4 py-2 mt-2 text-sm font-medium border border-border/10 hover:bg-foreground hover:text-background transition-colors text-left"
                >
                  Sign out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
} 