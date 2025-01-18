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
  focus: string[] | string;
  poses: YogaPose[];
  peak_poses: YogaPose[];
  created_at: string;
}

export default function SavedPage() {
  const router = useRouter();
  const [sequences, setSequences] = useState<SavedSequence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    duration: '',
    level: '',
    focus: '',
    peakPose: ''
  });

  const parseFocus = (focus: string | string[] | null): string[] => {
    if (!focus) return [];
    
    // If it's already an array, return it
    if (Array.isArray(focus)) return focus;
    
    // If it's a string that looks like a JSON array
    if (typeof focus === 'string') {
      try {
        const parsed = JSON.parse(focus);
        return Array.isArray(parsed) ? parsed : [focus];
      } catch {
        // If it's not JSON, return it as a single item
        return [focus];
      }
    }
    
    return [];
  };

  const filteredSequences = sequences.filter(sequence => {
    if (filters.duration && sequence.duration.toString() !== filters.duration) return false;
    if (filters.level && sequence.level !== filters.level) return false;
    
    if (filters.focus && sequence.focus) {
      const focusArray = parseFocus(sequence.focus);
      if (!focusArray.some(f => f === filters.focus)) {
        return false;
      }
    }
    
    if (filters.peakPose && (!sequence.peak_poses || !sequence.peak_poses.some(p => p.english_name === filters.peakPose))) {
      return false;
    }
    
    return true;
  });

  const getFilteredOptions = (currentFilter: keyof typeof filters) => {
    const relevantSequences = sequences.filter(sequence => {
      if (currentFilter !== 'duration' && filters.duration && sequence.duration.toString() !== filters.duration) return false;
      if (currentFilter !== 'level' && filters.level && sequence.level !== filters.level) return false;
      if (currentFilter !== 'focus' && filters.focus && sequence.focus) {
        const focusArray = parseFocus(sequence.focus);
        if (!focusArray.some(f => f === filters.focus)) return false;
      }
      if (currentFilter !== 'peakPose' && filters.peakPose && (!sequence.peak_poses || !sequence.peak_poses.some(p => p.english_name === filters.peakPose))) {
        return false;
      }
      return true;
    });

    switch (currentFilter) {
      case 'duration':
        return Array.from(new Set(relevantSequences.map(s => s.duration))).sort((a, b) => a - b);
      case 'level':
        return Array.from(new Set(relevantSequences.map(s => s.level))).filter(Boolean);
      case 'focus':
        return Array.from(new Set(relevantSequences.flatMap(s => parseFocus(s.focus)))).filter(Boolean).sort();
      case 'peakPose':
        return Array.from(new Set(relevantSequences.flatMap(s => (s.peak_poses || []).map(p => p.english_name)))).filter(Boolean).sort();
      default:
        return [];
    }
  };

  const availableDurations = getFilteredOptions('duration');
  const availableLevels = getFilteredOptions('level');
  const availableFocusAreas = getFilteredOptions('focus');
  const availablePeakPoses = getFilteredOptions('peakPose');

  // Only show filter dropdowns if they have values
  const showDurationFilter = availableDurations.length > 0;
  const showLevelFilter = availableLevels.length > 0;
  const showFocusFilter = availableFocusAreas.length > 0;
  const showPeakPoseFilter = availablePeakPoses.length > 0;

  console.log('All sequences:', sequences);
  console.log('Focus areas from sequences:', sequences.map(s => s.focus));
  console.log('Peak poses from sequences:', sequences.map(s => s.peak_poses));
  console.log('Unique focus areas:', availableFocusAreas);
  console.log('Unique peak poses:', availablePeakPoses);

  const formatFocusAreas = (focus: string[] | string | null) => {
    const focusArray = parseFocus(focus);
    if (focusArray.length === 0) return 'No focus areas';
    return focusArray.join(' • ');
  };

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
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (isMounted) {
          console.log('Raw sequences data:', data);
          // Log the structure of the first sequence to understand the data format
          if (data && data.length > 0) {
            console.log('First sequence structure:', {
              focus: data[0].focus,
              focusType: typeof data[0].focus,
              peak_pose: data[0].peak_pose,
              peak_pose_type: typeof data[0].peak_pose
            });
          }
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
          <div className="flex flex-col items-center gap-4 pt-4">
            {/* Filter Dropdowns */}
            <div className="flex flex-wrap justify-center gap-4">
              {showDurationFilter && !filters.duration && (
                <select
                  value={filters.duration}
                  onChange={(e) => setFilters(prev => ({ ...prev, duration: e.target.value }))}
                  className="bg-gray-800 text-gray-200 rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Durations</option>
                  {availableDurations.map(duration => (
                    <option key={duration} value={duration}>{duration} minutes</option>
                  ))}
                </select>
              )}
              {showLevelFilter && !filters.level && (
                <select
                  value={filters.level}
                  onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
                  className="bg-gray-800 text-gray-200 rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Levels</option>
                  {availableLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              )}
              {showFocusFilter && !filters.focus && (
                <select
                  value={filters.focus}
                  onChange={(e) => setFilters(prev => ({ ...prev, focus: e.target.value }))}
                  className="bg-gray-800 text-gray-200 rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Focus Areas</option>
                  {availableFocusAreas.map(focus => (
                    <option key={focus} value={focus}>{focus}</option>
                  ))}
                </select>
              )}
              {showPeakPoseFilter && !filters.peakPose && (
                <select
                  value={filters.peakPose}
                  onChange={(e) => setFilters(prev => ({ ...prev, peakPose: e.target.value }))}
                  className="bg-gray-800 text-gray-200 rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Peak Poses</option>
                  {availablePeakPoses.map(pose => (
                    <option key={pose} value={pose}>{pose}</option>
                  ))}
                </select>
              )}
            </div>
            {/* Active Filters */}
            {Object.entries(filters).some(([_, value]) => value) && (
              <div className="flex flex-wrap justify-center gap-2">
                {filters.duration && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30 flex items-center gap-2">
                    {filters.duration} minutes
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, duration: '' }))}
                      className="hover:text-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                )}
                {filters.level && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30 flex items-center gap-2">
                    {filters.level}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, level: '' }))}
                      className="hover:text-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                )}
                {filters.focus && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-500/30 flex items-center gap-2">
                    {filters.focus}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, focus: '' }))}
                      className="hover:text-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                )}
                {filters.peakPose && (
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm border border-yellow-500/30 flex items-center gap-2">
                    Peak: {filters.peakPose}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, peakPose: '' }))}
                      className="hover:text-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-6">
          {filteredSequences.length === 0 ? (
            <div className="text-center py-12">
              {sequences.length === 0 ? (
                <>
                  <p className="text-gray-400 mb-4">No saved sequences yet</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/generate')}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl px-6 py-3 font-medium transition-colors"
                  >
                    Create Your First Sequence
                  </motion.button>
                </>
              ) : (
                <p className="text-gray-400">No sequences match your filters</p>
              )}
            </div>
          ) : (
            filteredSequences.map((sequence) => (
              <motion.div
                key={sequence.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-2xl border border-white/10"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-3 flex-grow">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold text-white">
                        {sequence.name}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30">
                        {sequence.duration} minutes
                      </span>
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
                        {sequence.level}
                      </span>
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-500/30">
                        {sequence.poses.length} poses
                      </span>
                      {sequence.peak_poses?.length > 0 && (
                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm border border-yellow-500/30">
                          Peak: {sequence.peak_poses.map(p => p.english_name).join(' & ')}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-sm">
                        Focus: {formatFocusAreas(sequence.focus)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
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