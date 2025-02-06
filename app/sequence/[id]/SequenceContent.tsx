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
  is_liked?: boolean;
  profiles: {
    full_name: string;
  };
}

export default function SequencePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [sequence, setSequence] = useState<SequenceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    loadSequence();
  }, [params.id]);

  const loadSequence = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current session first
      const { data: { session } } = await supabase.auth.getSession();

      // Get the sequence
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

      // Get the profile data separately
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', sequenceData.user_id)
        .single();

      // Increment view count silently
      await supabase.rpc('increment_view_count', {
        sequence_id: params.id
      });

      let isLiked = false;

      if (session) {
        // Check if it's the user's own sequence
        if (sequenceData.user_id === session.user.id) {
          isLiked = true;
        } else {
          // Check if the user has liked this sequence
          const { data: likeData } = await supabase
            .from('sequence_likes')
            .select('id')
            .eq('sequence_id', params.id)
            .eq('user_id', session.user.id)
            .single();
          
          isLiked = !!likeData;
        }
      }

      const mappedSequence = {
        ...sequenceData,
        poses: JSON.parse(sequenceData.poses as unknown as string),
        is_liked: isLiked,
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

  const handleLikeToggle = async () => {
    try {
      if (!sequence) return;
      setIsLiking(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // Don't allow unliking own sequences
      if (sequence.user_id === session.user.id) {
        toast.error("You can't unlike your own sequence");
        return;
      }

      if (sequence.is_liked) {
        // Unlike and remove from saved sequences
        const { error: unlikeError } = await supabase
          .from('sequence_likes')
          .delete()
          .eq('sequence_id', sequence.id)
          .eq('user_id', session.user.id);

        if (unlikeError) throw unlikeError;

        setSequence({
          ...sequence,
          is_liked: false,
          like_count: sequence.like_count - 1
        });

        toast.success('Removed from saved sequences');
      } else {
        // Like and add to saved sequences
        const { error: likeError } = await supabase
          .from('sequence_likes')
          .insert({
            sequence_id: sequence.id,
            user_id: session.user.id
          });

        if (likeError) throw likeError;

        setSequence({
          ...sequence,
          is_liked: true,
          like_count: sequence.like_count + 1
        });

        toast.success('Added to saved sequences');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like status');
    } finally {
      setIsLiking(false);
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
            <button
              onClick={handleLikeToggle}
              disabled={isLiking || sequence.user_id === sequence?.user_id}
              className={`flex items-center gap-1 transition-colors ${
                sequence.is_liked 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-muted-foreground hover:text-red-500'
              }`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 ${isLiking ? 'animate-pulse' : ''}`}
                viewBox="0 0 20 20" 
                fill={sequence.is_liked ? 'currentColor' : 'none'}
                stroke="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" 
                  clipRule="evenodd" 
                />
              </svg>
              {sequence.like_count}
            </button>
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