'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { YogaPose } from '@/lib/data/poses';
import { Dialog } from '@headlessui/react';
import SequencePoseManager from '@/components/SequencePoseManager';

interface GeneratePageProps {}

function GenerateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingSequenceId = searchParams.get('edit');
  const poseId = searchParams.get('pose');
  
  const [showFilters, setShowFilters] = useState(true);
  const [duration, setDuration] = useState(30);
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Expert'>('Beginner');
  const [focus, setFocus] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sequence, setSequence] = useState<YogaPose[] | null>(null);
  const [poses, setPoses] = useState<YogaPose[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [title, setTitle] = useState('');
  const [peakPoses, setPeakPoses] = useState<YogaPose[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const focusOptions = [
    'Core & Balance',
    'Strength & Power',
    'Flexibility & Opening',
    'Back Bending',
    'Hip Opening',
    'Twists & Detox',
    'Inversions',
    'Arm Balances',
    'Restorative',
    'Peak Pose Practice'
  ];

  useEffect(() => {
    const checkAuthAndLoadPoses = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }

        // Load poses from Supabase
        const { data: posesData, error: posesError } = await supabase
          .from('poses')
          .select('*');

        if (posesError) throw posesError;
        setPoses(posesData);

        // If a pose ID was provided, add it to peak poses
        if (poseId) {
          const selectedPose = posesData.find(p => p.id === parseInt(poseId));
          if (selectedPose) {
            setPeakPoses([selectedPose]);
          }
        }

        // If editing an existing sequence, load it
        if (editingSequenceId) {
          const { data: sequenceData, error: sequenceError } = await supabase
            .from('sequences')
            .select('*')
            .eq('id', editingSequenceId)
            .single();

          if (sequenceError) throw sequenceError;
          if (sequenceData) {
            setSequence(sequenceData.poses);
            setTitle(sequenceData.name);
            setDuration(sequenceData.duration);
            setLevel(sequenceData.level);
            // Parse focus areas if they're a string
            const focusAreas = typeof sequenceData.focus === 'string' 
              ? JSON.parse(sequenceData.focus)
              : sequenceData.focus;
            setFocus(Array.isArray(focusAreas) ? focusAreas : []);
            if (sequenceData.peak_poses) {
              setPeakPoses(sequenceData.peak_poses);
            } else {
              setPeakPoses([]);
            }
            setShowFilters(false);
          }
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load poses');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadPoses();
  }, [router, editingSequenceId, poseId]);

  const generateSequence = async () => {
    setIsGenerating(true);
    setSequence(null);
    setShowFilters(false);

    try {
      const focusPosesData = peakPoses.map(pose => ({
        name: pose.english_name,
        sanskrit_name: pose.sanskrit_name,
        difficulty: pose.difficulty_level,
        category: pose.category_name,
        description: pose.pose_description
      }));

      const availablePosesData = poses.map(pose => ({
        id: pose.id,
        name: pose.english_name,
        sanskrit_name: pose.sanskrit_name,
        difficulty: pose.difficulty_level,
        category: pose.category_name,
        description: pose.pose_description
      }));

      const response = await fetch('/api/generate-sequence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          focus_poses: focusPosesData,
          duration,
          difficulty_level: level,
          focus_areas: focus,
          available_poses: availablePosesData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate sequence');
      }

      const data = await response.json();
      
      const generatedSequence = data.sequence.map((poseId: number) => 
        poses.find(p => p.id === poseId)
      ).filter((pose: YogaPose | undefined): pose is YogaPose => pose !== undefined);

      setSequence(generatedSequence);
      const peakPosesNames = peakPoses.length > 0 
        ? ` with ${peakPoses.map(p => p.english_name).join(' & ')}` 
        : '';
      // Clean up focus areas and create title
      const focusText = Array.isArray(focus) ? focus.join(' & ') : '';
      setTitle(`${duration}-Minute ${level}${focusText ? ' ' + focusText : ''} Flow${peakPosesNames}`);
    } catch (error) {
      console.error('Error generating sequence:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate sequence');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSequence = async () => {
    if (!sequence) return;
    
    setIsSaving(true);
    setSaveError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      // Clean up peak poses - only keep ones that still exist in the sequence
      const cleanedPeakPoses = peakPoses.filter(peakPose => 
        sequence.some(pose => pose.id === peakPose.id)
      );

      if (editingSequenceId) {
        // Update existing sequence
        console.log('Updating sequence with ID:', editingSequenceId);
        
        const { data, error: updateError } = await supabase.rpc(
          'update_sequence',
          {
            p_id: parseInt(editingSequenceId),
            p_name: title,
            p_duration: duration,
            p_level: level,
            p_focus: Array.isArray(focus) ? focus : [],
            p_poses: sequence,
            p_peak_poses: cleanedPeakPoses,
            p_user_id: session.user.id
          }
        );

        if (updateError) {
          console.error('Update error:', updateError);
          throw updateError;
        }

        console.log('Update response:', data);

        if (!data.success) {
          throw new Error(data.message || 'Failed to update sequence');
        }

        // Wait a moment and then force a reload of the saved page
        await new Promise(resolve => setTimeout(resolve, 500));
        router.refresh();
        router.replace('/saved');
      } else {
        // Create new sequence
        const { error: insertError } = await supabase
          .from('sequences')
          .insert({
            user_id: session.user.id,
            name: title,
            duration,
            level,
            focus: Array.isArray(focus) ? focus : [],
            poses: sequence,
            peak_poses: cleanedPeakPoses
          });

        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }

        // Wait a moment before redirecting to ensure the update is processed
        await new Promise(resolve => setTimeout(resolve, 500));
        router.refresh();
        router.push('/saved');
      }
    } catch (error: any) {
      console.error('Full error object:', error);
      // Handle Supabase errors specifically
      if (error.code) {
        setSaveError(`Database error (${error.code}): ${error.message}`);
      } else {
        setSaveError(error instanceof Error ? error.message : 'Failed to save sequence');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPeakPose = (pose: YogaPose) => {
    setPeakPoses([...peakPoses, pose]);
    setIsModalOpen(false);
    setSearchTerm('');
  };

  const handleRemovePeakPose = (poseToRemove: YogaPose) => {
    setPeakPoses(peakPoses.filter(pose => pose.english_name !== poseToRemove.english_name));
  };

  const filteredPoses = searchTerm
    ? poses.filter(pose => 
        pose.english_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pose.sanskrit_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : poses;

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
            {editingSequenceId ? 'Edit Sequence' : 'Generate Sequence'}
          </h1>
          <p className="text-xl text-gray-400">
            {editingSequenceId 
              ? 'Modify your existing sequence or regenerate a new one with the same settings' 
              : 'Create a personalized yoga sequence'}
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-8">
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300">
              {error}
            </div>
          )}

          {sequence && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilters(!showFilters)}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              <motion.svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                animate={{ rotate: showFilters ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </motion.button>
          )}

          <AnimatePresence mode="wait">
            {(!sequence || showFilters) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 bg-gray-800/50 backdrop-blur-lg p-8 rounded-2xl border border-white/10"
              >
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-300">
                    Duration (minutes)
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="60"
                    step="5"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-gray-400">{duration} minutes</div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-300">
                    Experience Level
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {(['Beginner', 'Intermediate', 'Expert'] as const).map((l) => (
                      <motion.button
                        key={l}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setLevel(l)}
                        className={`p-3 rounded-xl border ${
                          level === l
                            ? 'bg-blue-500/20 border-blue-500/30 text-blue-300'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {l}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Focus Areas
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {focusOptions.map((option) => (
                      <motion.button
                        key={option}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setFocus(prev => 
                            prev.includes(option)
                              ? prev.filter(f => f !== option)
                              : [...prev, option]
                          );
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                          focus.includes(option)
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {option}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Peak Poses
                  </label>
                  <div className="space-y-2">
                    {peakPoses.map((pose) => (
                      <div 
                        key={pose.english_name}
                        className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-white font-medium">{pose.english_name}</p>
                            <p className="text-sm text-gray-400">{pose.sanskrit_name}</p>
                          </div>
                          <button
                            onClick={() => handleRemovePeakPose(pose)}
                            className="text-gray-400 hover:text-red-400"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsModalOpen(true)}
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition-colors"
                    >
                      Add Peak Pose
                    </motion.button>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generateSequence}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl px-6 py-3 font-medium transition-colors disabled:opacity-50"
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Generating sequence...</span>
                    </div>
                  ) : (
                    'Generate Sequence'
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {sequence && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <h2 className="text-2xl font-bold text-white">
                        Your Generated Sequence
                      </h2>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveSequence}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl px-6 py-3 font-medium transition-colors disabled:opacity-50"
                    >
                      {isSaving ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Saving...</span>
                        </div>
                      ) : (
                        'Save Sequence'
                      )}
                    </motion.button>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Sequence Title
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter a title for your sequence"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>

                    {saveError && (
                      <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300">
                        {saveError}
                      </div>
                    )}

                    <SequencePoseManager
                      poses={sequence}
                      allPoses={poses}
                      level={level}
                      onPosesChange={setSequence}
                      peakPoses={peakPoses}
                      setPeakPoses={setPeakPoses}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <Dialog
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSearchTerm('');
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl bg-gray-800/90 backdrop-blur-lg rounded-2xl border border-white/10 p-6 shadow-xl">
            <Dialog.Title className="text-2xl font-bold text-white mb-4">
              Select Peak Pose
            </Dialog.Title>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Search for a pose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />

              <div className="max-h-[60vh] overflow-y-auto space-y-2">
                {filteredPoses
                  .filter(pose => 
                    pose.difficulty_level === level &&
                    !peakPoses.some(p => p.id === pose.id) &&
                    (searchTerm === '' || 
                      pose.english_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      pose.sanskrit_name.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                  .map((pose) => (
                    <button
                      key={pose.english_name}
                      onClick={() => handleAddPeakPose(pose)}
                      className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="text-left">
                          <h3 className="text-white font-medium">{pose.english_name}</h3>
                          <p className="text-sm text-gray-400">{pose.sanskrit_name}</p>
                        </div>
                        <span className="px-3 py-1 text-sm rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {pose.difficulty_level}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-400 text-left">{pose.pose_description}</p>
                    </button>
                  ))}
                {searchTerm && filteredPoses.length === 0 && (
                  <div className="text-center text-gray-400 py-4">
                    No poses found
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsModalOpen(false);
                    setSearchTerm('');
                  }}
                  className="px-6 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  Close
                </motion.button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

export default function GeneratePage({}: GeneratePageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 bg-gray-800/50 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
          <div className="text-center">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Loading...
            </h2>
          </div>
        </div>
      </div>
    }>
      <GenerateContent />
    </Suspense>
  );
} 