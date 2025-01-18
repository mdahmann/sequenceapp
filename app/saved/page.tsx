'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { YogaPose } from '@/lib/data/poses';

interface SavedSequence {
  id: string;
  name: string;
  duration: number;
  level: string;
  focus: string;
  poses: YogaPose[];
  created_at: string;
}

export default function SavedPage() {
  const router = useRouter();
  const [sequences, setSequences] = useState<SavedSequence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSequences = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }

        const { data, error } = await supabase
          .from('sequences')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (isMounted) {
          setSequences(data || []);
        }
      } catch (error) {
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Failed to load sequences');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSequences();
    router.refresh();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const { error } = await supabase
        .from('sequences')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSequences(sequences.filter(seq => seq.id !== id));
    } catch (error) {
      console.error('Error deleting sequence:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/generate?edit=${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Your Saved Flows
          </h1>
          <p className="text-xl text-gray-400">
            View and manage your saved sequences
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-6">
          {sequences.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No saved sequences yet</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/generate')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl px-6 py-3 font-medium transition-colors"
              >
                Create Your First Sequence
              </motion.button>
            </div>
          ) : (
            sequences.map((sequence) => (
              <motion.div
                key={sequence.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-2xl border border-white/10"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {sequence.name}
                    </h3>
                    <div className="space-y-1">
                      <p className="text-gray-400">Duration: {sequence.duration} minutes</p>
                      <p className="text-gray-400">Level: {sequence.level}</p>
                      <p className="text-gray-400">Focus: {sequence.focus}</p>
                      <p className="text-gray-400">Poses: {sequence.poses.length}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEdit(sequence.id)}
                      className="text-blue-400 hover:text-blue-300 p-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(sequence.id)}
                      disabled={isDeleting === sequence.id}
                      className="text-red-400 hover:text-red-300 p-2 disabled:opacity-50"
                    >
                      {isDeleting === sequence.id ? (
                        <div className="w-5 h-5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
} 