'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { YogaPose } from '@/lib/data/poses';
import ConfirmationModal from '@/components/ConfirmationModal';
import toast from 'react-hot-toast';
import { ShareIcon } from '@heroicons/react/24/outline';

interface SavedSequence {
  id: string;
  name: string;
  duration: number;
  level: string;
  focus: string[] | string;
  poses: YogaPose[];
  peak_poses: YogaPose[];
  created_at: string;
  is_public: boolean;
  is_liked: boolean;
  source: 'owned' | 'liked';
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (makePublic: boolean) => void;
  isPublic: boolean;
  sequenceId?: string;
}

function ShareModal({ isOpen, onClose, onShare, isPublic, sequenceId }: ShareModalProps) {
  const copyLink = async () => {
    if (!sequenceId) return;
    const shareUrl = `${window.location.origin}/sequence/${sequenceId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Failed to copy share link');
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-background p-6 rounded-xl border-2 border-border/10 shadow-xl"
        >
          <h3 className="text-xl font-bold mb-4">Share Sequence</h3>
          
          {isPublic ? (
            <div className="space-y-4">
              <p className="text-muted-foreground">This sequence is public and can be found in Discover.</p>
              
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium mb-2">Share Link</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/sequence/${sequenceId}`}
                    readOnly
                    className="flex-1 bg-background px-3 py-2 rounded border border-border text-sm"
                  />
                  <button
                    onClick={copyLink}
                    className="brutalist-button-secondary px-3 py-2"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => onShare(false)}
                  className="brutalist-button-secondary"
                >
                  Make Private
                </button>
                <button
                  onClick={onClose}
                  className="brutalist-button-primary"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">Make this sequence public to share it with the community?</p>
              <p className="text-sm text-muted-foreground">Public sequences will appear in Discover and can be viewed by anyone.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="brutalist-button-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onShare(true)}
                  className="brutalist-button-primary"
                >
                  Make Public
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
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
  const [shareSequence, setShareSequence] = useState<SavedSequence | null>(null);

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

  const parsePeakPoses = (peakPoses: string | YogaPose[] | null): YogaPose[] => {
    if (!peakPoses) return [];
    
    // If it's already an array, return it
    if (Array.isArray(peakPoses)) return peakPoses;
    
    // If it's a string that looks like a JSON array
    if (typeof peakPoses === 'string') {
      try {
        const parsed = JSON.parse(peakPoses);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    
    return [];
  };

  const parsePoses = (poses: string | YogaPose[] | null): YogaPose[] => {
    if (!poses) return [];
    
    if (Array.isArray(poses)) return poses;
    
    if (typeof poses === 'string') {
      try {
        const parsed = JSON.parse(poses);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
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
    
    if (filters.peakPose && sequence.peak_poses) {
      const peakPoses = parsePeakPoses(sequence.peak_poses);
      if (!peakPoses.some(p => p.english_name === filters.peakPose)) {
        return false;
      }
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
      if (currentFilter !== 'peakPose' && filters.peakPose && sequence.peak_poses) {
        const peakPoses = parsePeakPoses(sequence.peak_poses);
        if (!peakPoses.some(p => p.english_name === filters.peakPose)) {
          return false;
        }
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
        return Array.from(new Set(
          relevantSequences.flatMap(s => parsePeakPoses(s.peak_poses).map(p => p.english_name))
        )).filter(Boolean).sort();
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
    if (!focus) return 'No focus areas';
    
    // If it's already an array, join it
    if (Array.isArray(focus)) return focus.join(' • ');
    
    // If it's a string that looks like a JSON array or object
    if (typeof focus === 'string') {
      try {
        const parsed = JSON.parse(focus);
        if (Array.isArray(parsed)) {
          return parsed.join(' • ');
        }
        // If it's a JSON object, get its values
        if (typeof parsed === 'object' && parsed !== null) {
          return Object.values(parsed).join(' • ');
        }
        // If it's just a string in JSON quotes, return it without quotes
        return parsed.toString();
      } catch {
        // If it's not JSON, return it as is
        return focus;
      }
    }
    
    return 'No focus areas';
  };

  const loadSequences = async () => {
    try {
      setIsLoading(true);
      setError('');

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      if (!session) {
        router.push('/login');
        return;
      }

      // Get both owned and liked sequences
      const { data: ownedSequences, error: ownedError } = await supabase
        .from('sequences')
        .select('*')
        .eq('user_id', session.user.id);

      if (ownedError) throw ownedError;

      const { data: likedSequences, error: likedError } = await supabase
        .from('sequences')
        .select('*, sequence_likes!inner(*)')
        .eq('sequence_likes.user_id', session.user.id)
        .neq('user_id', session.user.id); // Don't include own sequences

      if (likedError) throw likedError;

      // Combine and format sequences
      const allSequences = [
        ...(ownedSequences || []).map(seq => ({
          ...seq,
          poses: parsePoses(seq.poses),
          peak_poses: parsePeakPoses(seq.peak_poses),
          focus: parseFocus(seq.focus),
          is_liked: true, // Own sequences are always liked
          source: 'owned' as const
        })),
        ...(likedSequences || []).map(seq => ({
          ...seq,
          poses: parsePoses(seq.poses),
          peak_poses: parsePeakPoses(seq.peak_poses),
          focus: parseFocus(seq.focus),
          is_liked: true,
          source: 'liked' as const
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setSequences(allSequences);
    } catch (error: any) {
      console.error('Error loading sequences:', error);
      setError(error.message || 'Failed to load sequences');
      toast.error('Failed to load sequences');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

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

  const handleShare = async (sequenceId: string) => {
    const sequence = sequences.find(s => s.id === sequenceId);
    if (sequence) {
      setShareSequence(sequence);
    }
  };

  const handleMakePublic = async (makePublic: boolean) => {
    if (!shareSequence) return;

    try {
      const { error } = await supabase
        .from('sequences')
        .update({ 
          is_public: makePublic,
          published_at: makePublic ? new Date().toISOString() : null
        })
        .eq('id', shareSequence.id);

      if (error) throw error;

      // Update local state
      setSequences(sequences.map(seq => 
        seq.id === shareSequence.id 
          ? { ...seq, is_public: makePublic }
          : seq
      ));

      // Show success message
      toast.success(makePublic 
        ? 'Sequence is now public and available in Discover!' 
        : 'Sequence is now private'
      );

      // Close modal
      setShareSequence(null);
    } catch (error) {
      console.error('Error updating sequence visibility:', error);
      toast.error('Failed to update sequence visibility');
    }
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Saved Sequences</h1>
        <p className="text-muted-foreground">
          View and manage your saved sequences
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : sequences.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No saved sequences yet</p>
          <button
            onClick={() => router.push('/generate')}
            className="mt-4 brutalist-button-primary"
          >
            Create Your First Sequence
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sequences.map((sequence) => (
            <motion.div
              key={sequence.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="brutalist-card"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">{sequence.name}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleShare(sequence.id)}
                    className="p-2 hover:text-primary transition-colors relative group"
                    title={sequence.is_public ? "View sharing options" : "Share sequence"}
                  >
                    <ShareIcon className="w-5 h-5" />
                    {sequence.is_public && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(sequence.id)}
                    className="p-2 hover:text-primary transition-colors"
                    title="Edit sequence"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setIsDeleting(sequence.id)}
                    className="p-2 text-red-500 hover:text-red-400 transition-colors"
                    title="Delete sequence"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="tag-primary">{sequence.level}</span>
                <span className="tag-secondary">{sequence.duration} min</span>
                {parseFocus(sequence.focus).map((focus) => (
                  <span key={focus} className="tag-accent">
                    {focus}
                  </span>
                ))}
                {sequence.is_public && (
                  <span className="tag-primary">Public</span>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                {sequence.poses.length} poses
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={!!isDeleting}
        onClose={() => setIsDeleting(null)}
        onConfirm={() => handleDelete(isDeleting!)}
        title="Delete Sequence"
        message="Are you sure you want to delete this sequence? This action cannot be undone."
      />

      <ShareModal
        isOpen={!!shareSequence}
        onClose={() => setShareSequence(null)}
        onShare={(makePublic) => handleMakePublic(makePublic)}
        isPublic={shareSequence?.is_public || false}
        sequenceId={shareSequence?.id}
      />
    </div>
  );
} 