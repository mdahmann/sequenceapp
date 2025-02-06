'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { YogaPose } from '@/types/YogaPose';
import { toast } from 'react-hot-toast';

interface SequenceDetails {
  id: string;
  name: string;
  duration: number;
  level: string;
  focus: string[];
  poses: YogaPose[];
  user_id: string;
  created_at: string;
  view_count: number;
  like_count: number;
  is_public: boolean;
  profiles: {
    full_name: string;
  };
}

export default function SequencePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [sequence, setSequence] = useState<SequenceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSequence();
  }, [params.id]);

  const loadSequence = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First get the sequence
      const { data: sequenceData, error: sequenceError } = await supabase
        .from('sequences')
        .select('*')
        .eq('id', params.id)
        .eq('is_public', true)
        .single();

      if (sequenceError) throw sequenceError;

      if (!sequenceData) {
        setError('Sequence not found');
        return;
      }

      // Then get the profile information
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', sequenceData.user_id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        // Don't throw here, just use a fallback name
      }

      // Map the data to include profile information
      const mappedSequence = {
        ...sequenceData,
        poses: JSON.parse(sequenceData.poses as unknown as string),
        profiles: {
          full_name: profileData?.full_name || 'Unknown User'
        }
      };

      setSequence(mappedSequence);
    } catch (error) {
      console.error('Error loading sequence:', error);
      setError('Failed to load sequence');
      toast.error('Failed to load sequence');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !sequence) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground mb-6">{error || 'Sequence not found'}</p>
          <button
            onClick={() => router.push('/discover')}
            className="brutalist-button-primary"
          >
            Back to Discover
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{sequence.name}</h1>
          <div className="flex flex-wrap gap-4 items-center text-muted-foreground">
            <p>by {sequence.profiles.full_name}</p>
            <div className="flex items-center gap-2">
              <span>{sequence.view_count} views</span>
              <span>•</span>
              <span>♥ {sequence.like_count}</span>
            </div>
          </div>
        </div>

        {/* Sequence Details */}
        <div className="brutalist-card mb-8">
          <div className="flex flex-wrap gap-4 mb-6">
            <span className="tag-primary">{sequence.level}</span>
            <span className="tag-secondary">{sequence.duration} min</span>
            {sequence.focus.map((focus) => (
              <span key={focus} className="tag-accent">
                {focus}
              </span>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-4">Poses ({sequence.poses.length})</h2>
          <div className="space-y-4">
            {sequence.poses.map((pose, index) => (
              <div
                key={`${pose.id}-${index}`}
                className="p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{pose.english_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {pose.sanskrit_name}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {index + 1} of {sequence.poses.length}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.push('/discover')}
            className="brutalist-button-secondary"
          >
            Back to Discover
          </button>
          <button
            onClick={() => router.push(`/generate?sequence=${sequence.id}`)}
            className="brutalist-button-primary"
          >
            Practice This Sequence
          </button>
        </div>
      </motion.div>
    </div>
  );
} 