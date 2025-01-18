'use client'

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setIsLoading(false);
    }
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center space-y-8 mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
          >
            Sequence AI
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto"
          >
            Create personalized yoga sequences with AI, explore poses, and enhance your practice
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-lg p-8 rounded-2xl border border-white/10 space-y-4"
          >
            <h2 className="text-2xl font-bold text-white">Explore Poses</h2>
            <p className="text-gray-400">
              Browse our comprehensive library of yoga poses, complete with descriptions, benefits, and difficulty levels.
            </p>
            <Link 
              href="/poses"
              className="block w-full bg-white/10 hover:bg-white/20 text-white rounded-xl px-6 py-3 text-center font-medium transition-colors"
            >
              View Pose Library
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-lg p-8 rounded-2xl border border-white/10 space-y-4"
          >
            <h2 className="text-2xl font-bold text-white">Generate Sequences</h2>
            <p className="text-gray-400">
              {isLoggedIn 
                ? "Create custom yoga sequences tailored to your level, duration, and focus areas."
                : "Sign in to create custom yoga sequences tailored to your practice."}
            </p>
            {isLoggedIn ? (
              <Link 
                href="/generate"
                className="block w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl px-6 py-3 text-center font-medium transition-colors"
              >
                Create Sequence
              </Link>
            ) : (
              <Link 
                href="/login"
                className="block w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl px-6 py-3 text-center font-medium transition-colors"
              >
                Sign In to Create
              </Link>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-400">
            Join our community of yoga practitioners and create your perfect practice
          </p>
        </motion.div>
      </div>
    </div>
  );
} 