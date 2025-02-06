'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { YogaPose } from '@/types/YogaPose';
import { toast } from 'react-hot-toast';

interface PublicSequence {
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
  profiles: {
    full_name: string;
  };
}

export default function DiscoverPage() {
  const router = useRouter();
  const [sequences, setSequences] = useState<PublicSequence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('recent'); // 'recent', 'popular', 'liked'
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [focusFilter, setFocusFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPublicSequences();
  }, [filter, difficultyFilter, focusFilter, durationFilter]);

  const loadPublicSequences = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First, get the sequences
      let query = supabase
        .from('sequences')
        .select('*')
        .eq('is_public', true);

      // Apply filters if they exist
      if (difficultyFilter !== 'all') {
        query = query.eq('level', difficultyFilter);
      }
      if (focusFilter !== 'all') {
        query = query.contains('focus', [focusFilter]);
      }

      const { data: sequencesData, error: sequencesError } = await query;
      console.log('Supabase sequences query result:', sequencesData);

      if (sequencesError) {
        console.error('Supabase sequences query error:', sequencesError);
        throw sequencesError;
      }

      if (!sequencesData) {
        setSequences([]);
        return;
      }

      // Get unique user IDs from sequences
      const userIds = Array.from(new Set(sequencesData.map(s => s.user_id)));

      // Fetch profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Supabase profiles query error:', profilesError);
        throw profilesError;
      }

      // Create a map of user_id to full_name
      const profileMap = new Map(
        profilesData?.map(profile => [profile.id, profile.full_name]) || []
      );

      // Map the sequences with profile information
      const mappedSequences = sequencesData.map(sequence => ({
        ...sequence,
        profiles: { 
          full_name: profileMap.get(sequence.user_id) || 'Unknown User'
        }
      }));

      setSequences(mappedSequences);
    } catch (error) {
      console.error('Error loading public sequences:', error);
      setError('Failed to load sequences');
      toast.error('Failed to load sequences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeSequence = async (sequenceId: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        router.push('/login');
        return;
      }

      const { error } = await supabase
        .from('sequence_likes')
        .insert({ sequence_id: sequenceId, user_id: session.session.user.id });

      if (error) throw error;
      loadPublicSequences();
    } catch (error) {
      console.error('Error liking sequence:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Discover Sequences</h1>
        <p className="text-muted-foreground">
          Explore and practice sequences shared by the community
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="brutalist-input"
        >
          <option value="recent">Most Recent</option>
          <option value="popular">Most Viewed</option>
          <option value="liked">Most Liked</option>
        </select>

        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="brutalist-input"
        >
          <option value="all">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Expert">Expert</option>
        </select>

        <select
          value={focusFilter}
          onChange={(e) => setFocusFilter(e.target.value)}
          className="brutalist-input"
        >
          <option value="all">All Focus Areas</option>
          <option value="Strength">Strength</option>
          <option value="Flexibility">Flexibility</option>
          <option value="Balance">Balance</option>
          <option value="Core">Core</option>
          <option value="Relaxation">Relaxation</option>
        </select>

        <select
          value={durationFilter}
          onChange={(e) => setDurationFilter(e.target.value)}
          className="brutalist-input"
        >
          <option value="all">Any Duration</option>
          <option value="15-30">15-30 minutes</option>
          <option value="30-45">30-45 minutes</option>
          <option value="45-60">45-60 minutes</option>
          <option value="60-90">60-90 minutes</option>
        </select>
      </div>

      {/* Sequences Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sequences.map((sequence) => (
            <motion.div
              key={sequence.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="brutalist-card hover:cursor-pointer"
              onClick={() => router.push(`/sequence/${sequence.id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">{sequence.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    by {sequence.profiles?.full_name || 'Unknown User'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {sequence.view_count} views
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLikeSequence(sequence.id);
                    }}
                    className="text-primary hover:text-primary/80"
                  >
                    ♥ {sequence.like_count}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="tag-primary">{sequence.level}</span>
                <span className="tag-secondary">{sequence.duration} min</span>
                {sequence.focus.slice(0, 2).map((focus) => (
                  <span key={focus} className="tag-accent">
                    {focus}
                  </span>
                ))}
              </div>

              <div className="text-sm text-muted-foreground">
                {sequence.poses.length} poses
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
} 