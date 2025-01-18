'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { YogaPose } from '@/lib/data/poses';
import { Dialog } from '@headlessui/react';
import { PlusIcon, TrashIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import SequencePoseManager from '@/components/SequencePoseManager';

interface GeneratePageProps {}

interface Suggestion {
  title: string;
  description: string;
}

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
  const [timing, setTiming] = useState<string[]>([]);
  const [transitions, setTransitions] = useState<string[]>([]);
  const [repetitions, setRepetitions] = useState<{[key: string]: {repeat: number; note: string}}>({});
  const [enabledFeatures, setEnabledFeatures] = useState<{
    timing?: boolean;
    transitions?: boolean;
    cues?: boolean;
  }>({
    timing: true,
    transitions: true,
    cues: true
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [originalValues, setOriginalValues] = useState<{
    name: string;
    duration: number;
    level: string;
    focus: string[];
    poses: YogaPose[];
    peak_poses: YogaPose[];
    timing: string[];
    transitions: string[];
    repetitions: {[key: string]: {repeat: number; note: string}};
    enabled_features: {
      timing?: boolean;
      transitions?: boolean;
      cues?: boolean;
    };
  } | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<Suggestion[]>([]);
  const [isLoadingAiSuggestions, setIsLoadingAiSuggestions] = useState(false);
  const [usedSuggestions, setUsedSuggestions] = useState<string[]>([]);
  const [hasLoadedSuggestions, setHasLoadedSuggestions] = useState(false);
  const [alternativePoses, setAlternativePoses] = useState<{[key: number]: YogaPose[]}>({});
  const [customPoses, setCustomPoses] = useState<YogaPose[]>([]);
  const [isLoadingCustomPoses, setIsLoadingCustomPoses] = useState(true);
  
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

  const yogaQuotes = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Life is available only in the present moment. - Thich Nhat Hanh",
    "Within you, there is a stillness and a sanctuary to which you can retreat at any time. - Hermann Hesse",
    "The quieter you become, the more you can hear. - Ram Dass",
    "Yoga is the journey of the self, through the self, to the self. - The Bhagavad Gita",
    "Everything is temporary. Breathe. - Unknown",
    "The soul always knows what to do to heal itself. The challenge is to silence the mind. - Caroline Myss",
    "In the midst of movement and chaos, keep stillness inside of you. - Deepak Chopra",
    "Your task is not to seek love, but merely to seek and find all the barriers within yourself that you have built against it. - Rumi",
    "The mind is everything. What you think you become. - Buddha",
    "Be a lamp to yourself. Be your own confidence. Hold on to the truth within yourself. - Buddha",
    "Between stimulus and response, there is a space. In that space is our power to choose our response. - Viktor Frankl",
    "The present moment is filled with joy and happiness. If you are attentive, you will see it. - Thich Nhat Hanh",
    "You cannot always control what goes on outside, but you can always control what goes on inside. - Wayne Dyer",
    "Quiet the mind, and the soul will speak. - Ma Jaya Sati Bhagavati"
  ];

  const [currentQuote, setCurrentQuote] = useState(() => Math.floor(Math.random() * yogaQuotes.length));

  useEffect(() => {
    if (isGenerating) {
      setCurrentQuote(Math.floor(Math.random() * yogaQuotes.length));
    }
  }, [isGenerating]);

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

  // Clean up focus areas to ensure they're a proper array of strings
  const cleanFocusArray = (focusInput: any): string[] => {
    // If it's already an array, clean each element
    if (Array.isArray(focusInput)) {
      return focusInput
        .map(f => f.toString().replace(/[{}"]/g, '').trim())
        .filter(Boolean);
    }

    // If it's a string
    if (typeof focusInput === 'string') {
      // If it's a Postgres array literal (e.g., "{Inversions,\"Strength & Power\"}")
      if (focusInput.startsWith('{') && focusInput.endsWith('}')) {
        return focusInput
          .slice(1, -1)           // Remove outer braces
          .match(/[^,]+/g)        // Split on commas, keeping quoted strings intact
          ?.map(f => f.trim().replace(/^"(.*)"$/, '$1').replace(/[{}"]/g, '')) // Remove quotes and clean
          .filter(Boolean) || [];
      }

      // Try parsing as JSON
      try {
        const parsed = JSON.parse(focusInput);
        if (Array.isArray(parsed)) {
          return parsed.map(f => f.toString().replace(/[{}"]/g, '').trim()).filter(Boolean);
        }
        if (typeof parsed === 'object' && parsed !== null) {
          return Object.keys(parsed).map(f => f.replace(/[{}"]/g, '').trim()).filter(Boolean);
        }
      } catch {
        // If it's a single string
        return [focusInput.replace(/[{}"]/g, '').trim()].filter(Boolean);
      }
    }

    // If it's an object
    if (typeof focusInput === 'object' && focusInput !== null) {
      return Object.keys(focusInput)
        .map(f => f.replace(/[{}"]/g, '').trim())
        .filter(Boolean);
    }

    return [];
  };

  useEffect(() => {
    const checkAuthAndLoadPoses = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }

        // Load poses from Supabase
        console.log('Fetching poses from Supabase...');
        const { data: posesData, error: posesError } = await supabase
          .from('poses')
          .select('*');

        if (posesError) {
          console.error('Error fetching poses:', posesError);
          throw posesError;
        }

        if (!posesData || posesData.length === 0) {
          console.error('No poses found in the database');
          throw new Error('No poses found in the database');
        }

        console.log(`Successfully loaded ${posesData.length} poses`);
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
            setTitle(sequenceData.name);
            setDuration(sequenceData.duration);
            setLevel(sequenceData.level);
            
            // Parse focus areas
            let parsedFocus = cleanFocusArray(sequenceData.focus);
            setFocus(parsedFocus);

            // Parse poses
            let parsedPoses = [];
            try {
              if (typeof sequenceData.poses === 'string') {
                parsedPoses = JSON.parse(sequenceData.poses);
            } else {
                parsedPoses = sequenceData.poses;
              }
            } catch (err) {
              console.error('Error parsing poses:', err);
              parsedPoses = [];
            }
            setSequence(parsedPoses);

            // Parse peak poses
            setPeakPoses(parsePeakPoses(sequenceData.peak_poses) || []);

            // Parse timing, transitions, and repetitions
            try {
              const parsedTiming = typeof sequenceData.timing === 'string' 
                ? JSON.parse(sequenceData.timing) 
                : sequenceData.timing || [];
              setTiming(parsedTiming);

              const parsedTransitions = typeof sequenceData.transitions === 'string'
                ? JSON.parse(sequenceData.transitions)
                : sequenceData.transitions || [];
              setTransitions(parsedTransitions);

              const parsedRepetitions = typeof sequenceData.repetitions === 'string'
                ? JSON.parse(sequenceData.repetitions)
                : sequenceData.repetitions || {};
              setRepetitions(parsedRepetitions);

              const parsedEnabledFeatures = typeof sequenceData.enabled_features === 'string'
                ? JSON.parse(sequenceData.enabled_features)
                : sequenceData.enabled_features || {
                    timing: true,
                    transitions: true,
                    cues: true
                  };
              setEnabledFeatures(parsedEnabledFeatures);
            } catch (err) {
              console.error('Error parsing sequence data:', err);
              setTiming([]);
              setTransitions([]);
              setRepetitions({});
              setEnabledFeatures({
                timing: true,
                transitions: true,
                cues: true
              });
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

  // Load original values when editing
  useEffect(() => {
    if (!editingSequenceId) {
      setHasChanges(true);
      return;
    }

    const loadSequence = async () => {
      setIsLoading(true);
      try {
        const { data: sequence, error } = await supabase
          .from('sequences')
          .select('*')
          .eq('id', editingSequenceId)
          .single();

        if (error) throw error;

        if (sequence) {
          // Store original values for comparison
          setOriginalValues({
            name: sequence.name,
            duration: sequence.duration,
            level: sequence.level,
            focus: sequence.focus || [],
            poses: typeof sequence.poses === 'string' ? JSON.parse(sequence.poses) : sequence.poses,
            peak_poses: parsePeakPoses(sequence.peak_poses) || [],
            timing: typeof sequence.timing === 'string' ? JSON.parse(sequence.timing) : sequence.timing || [],
            transitions: typeof sequence.transitions === 'string' ? JSON.parse(sequence.transitions) : sequence.transitions || [],
            repetitions: typeof sequence.repetitions === 'string' ? JSON.parse(sequence.repetitions) : sequence.repetitions || {},
            enabled_features: typeof sequence.enabled_features === 'string' 
              ? JSON.parse(sequence.enabled_features) 
              : sequence.enabled_features || {
                  timing: true,
                  transitions: true,
                  cues: true
                }
          });
        }
      } catch (error) {
        console.error('Error loading sequence:', error);
        setError('Failed to load sequence');
      } finally {
        setIsLoading(false);
      }
    };

    loadSequence();
  }, [editingSequenceId]);

  // Check for changes whenever relevant state updates
  useEffect(() => {
    if (!originalValues || !editingSequenceId) {
      return;
    }

    const hasNameChange = title !== originalValues.name;
    const hasDurationChange = duration !== originalValues.duration;
    const hasLevelChange = level !== originalValues.level;
    const hasFocusChange = JSON.stringify(focus) !== JSON.stringify(originalValues.focus);
    const hasPosesChange = JSON.stringify(sequence) !== JSON.stringify(originalValues.poses);
    const hasPeakPosesChange = JSON.stringify(peakPoses) !== JSON.stringify(originalValues.peak_poses);
    const hasTimingChange = JSON.stringify(timing) !== JSON.stringify(originalValues.timing);
    const hasTransitionsChange = JSON.stringify(transitions) !== JSON.stringify(originalValues.transitions);
    const hasRepetitionsChange = JSON.stringify(repetitions) !== JSON.stringify(originalValues.repetitions);
    const hasEnabledFeaturesChange = JSON.stringify(enabledFeatures) !== JSON.stringify(originalValues.enabled_features);

    setHasChanges(
      hasNameChange || hasDurationChange || hasLevelChange || hasFocusChange || 
      hasPosesChange || hasPeakPosesChange || hasTimingChange || hasTransitionsChange || 
      hasRepetitionsChange || hasEnabledFeaturesChange
    );
  }, [
    editingSequenceId,
    originalValues,
    title,
    duration,
    level,
    focus,
    sequence,
    peakPoses,
    timing,
    transitions,
    repetitions,
    enabledFeatures
  ]);

  const calculatePoseRange = (duration: number) => {
    const minimumPoses = Math.max(5, Math.floor(duration / 3));
    const maximumPoses = Math.floor(duration / 2); // This gives a good upper limit for the duration
    return {
      minimum_poses: minimumPoses,
      maximum_poses: maximumPoses,
      target_duration_minutes: duration
    };
  };

  const fetchCustomPoses = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        setCustomPoses([]);
        return;
      }

      const { data, error } = await supabase
        .from('custom_poses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setCustomPoses(data || []);
    } catch (error) {
      console.error('Error fetching custom poses:', error);
      setCustomPoses([]);
    } finally {
      setIsLoadingCustomPoses(false);
    }
  };

  useEffect(() => {
    fetchCustomPoses();
  }, []);

  const allAvailablePoses = useMemo(() => {
    return [...poses, ...customPoses];
  }, [poses, customPoses]);

  const generateSequence = async () => {
    setIsGenerating(true);
    setSequence(null);
    setTiming([]);
    setTransitions([]);
    setRepetitions({});
    setShowFilters(false);
    setError('');
    setAiSuggestions([]); // Reset suggestions when generating new sequence

    try {
      const focusPosesData = peakPoses.map(pose => ({
        name: pose.english_name,
        sanskrit_name: pose.sanskrit_name,
        difficulty: pose.difficulty_level,
        category: pose.category_name,
        description: pose.pose_description
      }));

      const availablePosesData = allAvailablePoses.map(pose => ({
        id: pose.id,
        name: pose.english_name,
        sanskrit_name: pose.sanskrit_name,
        difficulty: pose.difficulty_level,
        category: pose.category_name,
        description: pose.pose_description
      }));

      if (!availablePosesData.length) {
        throw new Error('No poses available for sequence generation');
      }

      const poseRange = calculatePoseRange(duration);

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
          available_poses: availablePosesData,
          ...poseRange,
          duration_guidance: `This sequence should be designed to take exactly ${duration} minutes to complete, with appropriate time for each pose and transitions.`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate sequence');
      }

      const data = await response.json();
      
      if (!data.sequence || !Array.isArray(data.sequence) || data.sequence.length === 0) {
        throw new Error('No poses returned in the sequence');
      }

      let generatedSequence = data.sequence
        .map((poseId: number) => allAvailablePoses.find((p: YogaPose) => p.id === poseId))
        .filter((pose: YogaPose | undefined): pose is YogaPose => pose !== undefined);

      if (generatedSequence.length === 0) {
        throw new Error('No valid poses found in the generated sequence');
      }

      // If sequence is too short, add complementary poses
      if (generatedSequence.length < poseRange.minimum_poses) {
        const complementaryPoses = await fetch('/api/get-complementary-poses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            current_sequence: generatedSequence.map((p: YogaPose) => p.id),
            focus_areas: focus,
            level,
            poses_needed: poseRange.minimum_poses - generatedSequence.length,
            target_duration_minutes: duration,
            available_poses: availablePosesData
          }),
        });

        if (!complementaryPoses.ok) {
          const errorData = await complementaryPoses.json();
          throw new Error(errorData.error || 'Failed to get complementary poses');
        }

        const complementaryData = await complementaryPoses.json();
        
        if (!complementaryData.poses || !Array.isArray(complementaryData.poses)) {
          throw new Error('Invalid complementary poses response');
        }

        const additionalPoses = complementaryData.poses
          .map((poseId: number) => allAvailablePoses.find((p: YogaPose) => p.id === poseId))
          .filter((pose: YogaPose | undefined): pose is YogaPose => pose !== undefined);

        if (additionalPoses.length === 0 && complementaryData.poses.length > 0) {
          throw new Error('No valid complementary poses found');
        }

        // Add the complementary poses to the sequence
        generatedSequence = [...generatedSequence, ...additionalPoses];
        
        // Generate new timing and transitions for the complete sequence
        const timingResponse = await fetch('/api/generate-timing-transitions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sequence: generatedSequence.map((p: YogaPose) => p.id),
            duration,
            level,
            target_duration_minutes: duration
          }),
        });

        if (!timingResponse.ok) {
          const errorData = await timingResponse.json();
          throw new Error(errorData.error || 'Failed to generate timing and transitions');
        }

        const timingData = await timingResponse.json();
        setTiming(timingData.timing || []);
        setTransitions(timingData.transitions || []);
        setRepetitions(timingData.repetitions || {});
      } else {
      setTiming(data.timing || []);
      setTransitions(data.transitions || []);
      setRepetitions(data.repetitions || {});
      }

      setSequence(generatedSequence);
      const peakPosesNames = peakPoses.length > 0 
        ? ` with ${peakPoses.map(p => p.english_name).join(' & ')}` 
        : '';
      const focusText = Array.isArray(focus) ? focus.join(' & ') : '';
      setTitle(`${duration}-Minute ${level}${focusText ? ' ' + focusText : ''} Flow${peakPosesNames}`);

      // Fetch AI suggestions and alternative poses in parallel
      try {
        const [suggestionsResponse, alternativePosesResponse] = await Promise.all([
          fetch('/api/suggest-sequence-improvements', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sequence: generatedSequence,
              focus,
              level,
              duration
            }),
          }),
          fetch('/api/suggest-pose-alternatives', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sequence: generatedSequence,
              available_poses: availablePosesData,
              focus,
              level,
              duration
            }),
          })
        ]);

        if (!suggestionsResponse.ok) throw new Error('Failed to get suggestions');
        if (!alternativePosesResponse.ok) throw new Error('Failed to get alternative poses');

        const [suggestionsData, alternativePosesData] = await Promise.all([
          suggestionsResponse.json(),
          alternativePosesResponse.json()
        ]);

        setAiSuggestions(suggestionsData.suggestions);
        setAlternativePoses(alternativePosesData.alternatives);
        setHasLoadedSuggestions(true);
      } catch (error) {
        console.error('Error getting AI suggestions:', error);
        // Don't throw here - we still want the sequence to be usable even if suggestions fail
      }
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

      // Clean up peak poses
      const cleanedPeakPoses = peakPoses.filter(peakPose => 
        sequence.some(pose => pose.id === peakPose.id)
      );

      // Clean up focus areas and ensure it's a proper array
      const formattedFocus = cleanFocusArray(focus);

      // Prepare the data
      const sequenceData = {
        user_id: session.user.id,
        name: title,
        duration,
        level,
        focus: formattedFocus,
        poses: sequence,
        peak_poses: cleanedPeakPoses,
        timing,
        transitions,
        repetitions,
        enabled_features: enabledFeatures
      };

      if (editingSequenceId) {
        const { data, error: updateError } = await supabase.rpc(
          'update_sequence',
          {
            p_id: parseInt(editingSequenceId),
            p_duration: duration,
            p_enabled_features: JSON.stringify(enabledFeatures),
            p_focus: formattedFocus,
            p_level: level,
            p_name: title,
            p_peak_poses: JSON.stringify(cleanedPeakPoses),
            p_poses: JSON.stringify(sequence),
            p_repetitions: JSON.stringify(repetitions),
            p_timing: JSON.stringify(timing),
            p_transitions: JSON.stringify(transitions),
            p_user_id: session.user.id
          }
        );

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('sequences')
          .insert(sequenceData);

        if (insertError) throw insertError;
      }

        await new Promise(resolve => setTimeout(resolve, 500));
        router.refresh();
        router.push('/saved');
    } catch (error: any) {
      console.error('Save error:', error);
        setSaveError(error instanceof Error ? error.message : 'Failed to save sequence');
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
    ? allAvailablePoses.filter(pose => 
        pose.english_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pose.sanskrit_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allAvailablePoses;

  // Modify getAiSuggestions function
  const getAiSuggestions = async (customPrompt?: string) => {
    // If we have a custom prompt, fetch new suggestions
    if (customPrompt) {
      setIsLoadingAiSuggestions(true);
      try {
        const response = await fetch('/api/suggest-sequence-improvements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sequence,
            focus,
            level,
            duration,
            customPrompt
          }),
        });

        if (!response.ok) throw new Error('Failed to get suggestions');
        const data = await response.json();
        setAiSuggestions(data.suggestions);
      } catch (error) {
        console.error('Error getting AI suggestions:', error);
      } finally {
        setIsLoadingAiSuggestions(false);
      }
      return;
    }

    // If we already have suggestions and no custom prompt, just show the modal
    if (hasLoadedSuggestions) {
      return;
    }

    // If we don't have suggestions yet (rare case), fetch them
    setIsLoadingAiSuggestions(true);
    try {
      const response = await fetch('/api/suggest-sequence-improvements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sequence,
          focus,
          level,
          duration
        }),
      });

      if (!response.ok) throw new Error('Failed to get suggestions');
      const data = await response.json();
      setAiSuggestions(data.suggestions);
      setHasLoadedSuggestions(true);
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
    } finally {
      setIsLoadingAiSuggestions(false);
    }
  };

  const handleSuggestionClick = async (suggestionStr: string) => {
    try {
      setIsLoadingAiSuggestions(true);
      const suggestion = JSON.parse(suggestionStr);
      
      await handleReviseSequence(suggestion.title + ': ' + suggestion.description);
      setUsedSuggestions([...usedSuggestions, suggestionStr]);
      setIsAiModalOpen(false);
    } catch (error) {
      console.error('Error handling suggestion:', error);
    } finally {
      setIsLoadingAiSuggestions(false);
    }
  };

  const getComplementaryPoses = async (currentSequence: YogaPose[], posesNeeded: number, targetDuration: number): Promise<YogaPose[]> => {
    try {
      const response = await fetch('/api/get-complementary-poses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_sequence: currentSequence.map(p => p.id),
          focus_areas: focus,
          level,
          poses_needed: posesNeeded,
          target_duration_minutes: targetDuration,
          available_poses: allAvailablePoses.map(pose => ({
            id: pose.id,
            name: pose.english_name,
            sanskrit_name: pose.sanskrit_name,
            difficulty: pose.difficulty_level,
            category: pose.category_name,
            description: pose.pose_description
          }))
        }),
      });

      if (!response.ok) {
        // If the API fails, fall back to selecting poses manually
        console.warn('Complementary poses API failed, using fallback selection');
        return getFallbackComplementaryPoses(currentSequence, posesNeeded);
      }

      const data = await response.json();
      const additionalPoses = data.poses
        .map((poseId: number) => allAvailablePoses.find((p: YogaPose) => p.id === poseId))
        .filter((pose: YogaPose | undefined): pose is YogaPose => pose !== undefined);

      if (additionalPoses.length < posesNeeded) {
        // If we didn't get enough poses, supplement with fallback selection
        const remainingPosesNeeded = posesNeeded - additionalPoses.length;
        const fallbackPoses = getFallbackComplementaryPoses([...currentSequence, ...additionalPoses], remainingPosesNeeded);
        return [...additionalPoses, ...fallbackPoses];
      }

      return additionalPoses;
    } catch (error) {
      console.warn('Error getting complementary poses:', error);
      return getFallbackComplementaryPoses(currentSequence, posesNeeded);
    }
  };

  const getFallbackComplementaryPoses = (currentSequence: YogaPose[], posesNeeded: number): YogaPose[] => {
    // Filter available poses to match current level and not already in sequence
    const availablePoses = allAvailablePoses.filter(pose => 
      pose.difficulty_level === level &&
      !currentSequence.some(p => p.id === pose.id)
    );

    // Sort poses by relevance to current focus areas
    const sortedPoses = availablePoses.sort((a, b) => {
      const aRelevance = focus.some(f => 
        a.category_name.toLowerCase().includes(f.toLowerCase()) ||
        a.pose_description.toLowerCase().includes(f.toLowerCase())
      ) ? 1 : 0;
      const bRelevance = focus.some(f => 
        b.category_name.toLowerCase().includes(f.toLowerCase()) ||
        b.pose_description.toLowerCase().includes(f.toLowerCase())
      ) ? 1 : 0;
      return bRelevance - aRelevance;
    });

    // Select the needed number of poses
    return sortedPoses.slice(0, posesNeeded);
  };

  const handleReviseSequence = async (suggestion?: string, customPrompt?: string) => {
    setIsLoadingAiSuggestions(true);
    setIsGenerating(true);
    try {
      const poseRange = calculatePoseRange(duration);
      
      const response = await fetch('/api/revise-sequence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sequence,
          suggestion,
          customPrompt,
          focus,
          level,
          duration,
          ...poseRange,
          original_sequence_length: sequence?.length || 0,
          available_poses: allAvailablePoses.map((pose: YogaPose) => ({
            id: pose.id,
            name: pose.english_name,
            sanskrit_name: pose.sanskrit_name,
            difficulty: pose.difficulty_level,
            category: pose.category_name,
            description: pose.pose_description
          })),
          maintain_minimum_poses: true,
          current_focus_areas: focus,
          current_level: level,
          duration_guidance: `This sequence should be designed to take exactly ${duration} minutes to complete, with appropriate time for each pose and transitions.`
        }),
      });
      
      if (!response.ok) throw new Error('Failed to revise sequence');
      const data = await response.json();
      
      if (!data.sequence || !Array.isArray(data.sequence)) {
        throw new Error('Invalid sequence data returned from API');
      }

      // Map the returned pose IDs back to full pose objects
      let revisedSequence = data.sequence
        .map((poseId: number) => allAvailablePoses.find((p: YogaPose) => p.id === poseId))
        .filter((pose: YogaPose | undefined): pose is YogaPose => pose !== undefined);
      
      // If we still don't have enough poses, add complementary poses
      if (revisedSequence.length < poseRange.minimum_poses) {
        const additionalPoses = await getComplementaryPoses(
          revisedSequence,
          poseRange.minimum_poses - revisedSequence.length,
          duration
        );

        // Add the complementary poses to the sequence
        revisedSequence = [...revisedSequence, ...additionalPoses];
      }

      // Generate timing and transitions for the complete sequence
      const timingResponse = await fetch('/api/generate-timing-transitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sequence: revisedSequence.map((p: YogaPose) => p.id),
          duration,
          level,
          target_duration_minutes: duration
        }),
      });

      if (timingResponse.ok) {
        const timingData = await timingResponse.json();
        setTiming(timingData.timing || []);
        setTransitions(timingData.transitions || []);
        setRepetitions(timingData.repetitions || {});
      }
      
      setSequence(revisedSequence);
      setHasChanges(true);
      setIsAiModalOpen(false);
      setAiPrompt('');
    } catch (error) {
      console.error('Error revising sequence:', error);
      setError(error instanceof Error ? error.message : 'Failed to revise sequence. Please try again.');
    } finally {
      setIsLoadingAiSuggestions(false);
      setIsGenerating(false);
    }
  };

  const handleDurationChange = async (newDuration: number) => {
    setDuration(newDuration);
    setIsGenerating(true);
    
    try {
      // If we have a sequence, check if we need to adjust it
      if (sequence) {
        const minimumPoses = Math.max(5, Math.floor(newDuration / 3));
        
        if (sequence.length < minimumPoses) {
          // Need to add more poses
          const complementaryPoses = await fetch('/api/get-complementary-poses', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              current_sequence: sequence.map((p: YogaPose) => p.id),
              focus_areas: focus,
              level,
              poses_needed: minimumPoses - sequence.length,
              available_poses: allAvailablePoses.map((pose: YogaPose) => ({
                id: pose.id,
                name: pose.english_name,
                sanskrit_name: pose.sanskrit_name,
                difficulty: pose.difficulty_level,
                category: pose.category_name,
                description: pose.pose_description
              }))
            }),
          });

          if (complementaryPoses.ok) {
            const complementaryData = await complementaryPoses.json();
            const additionalPoses = complementaryData.poses
              .map((poseId: number) => allAvailablePoses.find((p: YogaPose) => p.id === poseId))
              .filter((pose: YogaPose | undefined): pose is YogaPose => pose !== undefined);

            // Add the complementary poses to the sequence
            const finalSequence = [...sequence, ...additionalPoses];
            setSequence(finalSequence);
            
            // Generate new timing and transitions for the complete sequence
            const timingResponse = await fetch('/api/generate-timing-transitions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                sequence: finalSequence.map((p: YogaPose) => p.id),
                duration: newDuration,
                level
              }),
            });

            if (timingResponse.ok) {
              const timingData = await timingResponse.json();
              setTiming(timingData.timing || []);
              setTransitions(timingData.transitions || []);
              setRepetitions(timingData.repetitions || {});
            }
          }
        }
      }
      setHasChanges(true);
    } catch (error) {
      console.error('Error adjusting sequence for new duration:', error);
      setError('Failed to adjust sequence for new duration');
    } finally {
      setIsGenerating(false);
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
    <>
      <AnimatePresence>
        {isGenerating && (
      <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 bg-gradient-to-br backdrop-blur-md flex items-center justify-center z-[100]"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <motion.div
              animate={{
                background: [
                  'linear-gradient(to bottom right, rgb(30, 41, 59, 0.95), rgb(15, 23, 42, 0.95))',
                  'linear-gradient(to bottom right, rgb(88, 28, 135, 0.95), rgb(30, 41, 59, 0.95))',
                  'linear-gradient(to bottom right, rgb(30, 58, 138, 0.95), rgb(30, 41, 59, 0.95))',
                  'linear-gradient(to bottom right, rgb(30, 41, 59, 0.95), rgb(15, 23, 42, 0.95))',
                ]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0"
            />
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full flex items-center justify-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
                style={{ width: '40vh', height: '40vh' }}
              />
              <motion.div
                className="relative text-center z-10 max-w-md px-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={currentQuote}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-white/80 text-2xl font-light tracking-wide leading-relaxed mb-12"
                    transition={{
                      duration: 0.6,
                      ease: "easeOut"
                    }}
                  >
                    {yogaQuotes[currentQuote].split(' - ')[0]}
                    <span className="block mt-4 text-lg text-white/50">
                      — {yogaQuotes[currentQuote].split(' - ')[1]}
                    </span>
                  </motion.p>
                </AnimatePresence>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="relative"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="relative"
                  >
                    {isGenerating && (
                      <motion.p
                        animate={{
                          y: [0, -6, 0],
                          opacity: [0.6, 1, 0.6],
                          textShadow: [
                            '0 0 8px rgba(147, 197, 253, 0.3)',
                            '0 0 16px rgba(147, 197, 253, 0.5)',
                            '0 0 8px rgba(147, 197, 253, 0.3)'
                          ]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="text-blue-300/80 text-sm font-light tracking-widest uppercase"
                      >
                        {isLoadingAiSuggestions ? 'Regenerating your sequence' : 'Loading your sequence'}
                      </motion.p>
                    )}
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isGenerating ? 0 : 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6 sm:space-y-8"
      >
        <div className="text-center space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            {editingSequenceId ? 'Edit Sequence' : 'Generate Sequence'}
          </h1>
          <p className="text-lg sm:text-xl text-gray-400">
            {editingSequenceId 
              ? 'Modify your existing sequence or regenerate a new one with the same settings' 
              : 'Create a personalized yoga sequence'}
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
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
                className="space-y-6 bg-gray-800/50 backdrop-blur-lg p-4 sm:p-8 rounded-2xl border border-white/10"
              >
                <div className="space-y-3 sm:space-y-4">
                  <label className="block text-sm font-medium text-gray-300">
                    Duration (minutes)
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="60"
                    step="5"
                    value={duration}
                    onChange={(e) => handleDurationChange(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-gray-400">{duration} minutes</div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <label className="block text-sm font-medium text-gray-300">
                    Experience Level
                  </label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    {(['Beginner', 'Intermediate', 'Expert'] as const).map((l) => (
                      <motion.button
                        key={l}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setLevel(l)}
                        className={`p-2 sm:p-3 rounded-xl border text-sm sm:text-base ${
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                        className={`px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
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

                <div className="space-y-3 sm:space-y-4">
                  <label className="block text-sm font-medium text-gray-300">
                    Peak Poses
                  </label>
                  <div className="space-y-2">
                    {peakPoses.map((pose) => (
                      <div 
                        key={pose.english_name}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                      >
                          <div>
                          <div className="font-medium text-white">{pose.english_name}</div>
                          <div className="text-sm text-gray-400">{pose.sanskrit_name}</div>
                          </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemovePeakPose(pose)}
                          className="p-1.5 text-red-400 hover:text-red-300 transition-colors"
                          >
                          <TrashIcon className="w-5 h-5" />
                        </motion.button>
                      </div>
                    ))}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsModalOpen(true)}
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                    >
                      <PlusIcon className="w-5 h-5" />
                      Add Peak Pose
                    </motion.button>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsGenerating(true);
                    generateSequence();
                  }}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl px-4 sm:px-6 py-3 font-medium transition-colors disabled:opacity-50"
                >
                  Generate Sequence
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {sequence && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="w-full space-y-4">
                      <div className="flex items-center gap-2">
                        <input
                          id="sequence-title"
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter a title for your sequence"
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-lg sm:text-xl font-medium text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setIsAiModalOpen(true);
                            getAiSuggestions();
                          }}
                          className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M10.5 3.798v5.02a3 3 0 01-.879 2.121l-2.377 2.377a9.845 9.845 0 015.091 1.013 8.315 8.315 0 005.713.636l.285-.071-3.954-3.955a3 3 0 01-.879-2.121v-5.02a23.614 23.614 0 00-3 0zm4.5.138a.75.75 0 00.093-1.495A24.837 24.837 0 0012 2.25a25.048 25.048 0 00-3.093.191A.75.75 0 009 3.936v4.882a1.5 1.5 0 01-.44 1.06l-6.293 6.294c-1.62 1.621-.903 4.475 1.471 4.88 2.686.46 5.447.698 8.262.698 2.816 0 5.576-.239 8.262-.697 2.373-.406 3.092-3.26 1.47-4.881L15.44 9.879A1.5 1.5 0 0115 8.818V3.936z" clipRule="evenodd" />
                          </svg>
                        </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveSequence}
                          disabled={!hasChanges || isSaving}
                          className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isSaving ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                            <DocumentArrowDownIcon className="w-6 h-6" />
                      )}
                    </motion.button>
                  </div>
                    </div>
                      </div>
                </div>

                    <SequencePoseManager
                      poses={sequence}
                  allPoses={allAvailablePoses}
                      level={level}
                      onPosesChange={setSequence}
                      peakPoses={peakPoses}
                      setPeakPoses={setPeakPoses}
                      timing={timing}
                      transitions={transitions}
                      repetitions={repetitions}
                  enabledFeatures={enabledFeatures}
                  onEnabledFeaturesChange={setEnabledFeatures}
                    />
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

      {/* AI Suggestions Modal */}
      <Dialog
        open={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-xl bg-gray-800/90 backdrop-blur-lg rounded-2xl border border-white/10 p-6 shadow-xl">
            <Dialog.Title className="text-2xl font-bold text-white mb-6">
              AI Sequence Analysis
            </Dialog.Title>

            <div className="space-y-6">
              {isLoadingAiSuggestions ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                  <p className="text-gray-400">Analyzing your sequence...</p>
    </div>
              ) : aiSuggestions.length > 0 ? (
                <div className="space-y-4">
                  {aiSuggestions.slice(0, 3).map((suggestion, index) => {
                    const title = suggestion.title;
                    const description = suggestion.description;
                    const isUsed = usedSuggestions.includes(JSON.stringify(suggestion));
                    
                    return (
                      <motion.button
                        key={index}
                        whileHover={{ scale: isUsed ? 1 : 1.02 }}
                        whileTap={{ scale: isUsed ? 1 : 0.98 }}
                        onClick={() => !isUsed && handleSuggestionClick(JSON.stringify(suggestion))}
                        className={`w-full p-4 border rounded-xl transition-all group text-left ${
                          isUsed 
                            ? 'bg-gray-800/50 border-gray-700/50 cursor-not-allowed opacity-50' 
                            : 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border-purple-500/20'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg mt-1 ${
                            isUsed ? 'bg-gray-700/50 text-gray-500' : 'bg-purple-500/20 text-purple-300 group-hover:bg-purple-500/30 group-hover:text-purple-200'
                          }`}>
                            {isUsed ? (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <h3 className={`font-medium text-lg ${isUsed ? 'text-gray-500' : 'text-white group-hover:text-white/90'} mb-1`}>
                              {title}
                            </h3>
                            <p className={isUsed ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-300'}>
                              {description}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}

                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-gray-400 mb-2">Custom Revision</p>
                    <form 
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!aiPrompt.trim()) return;
                        await handleReviseSequence(undefined, aiPrompt.trim());
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Enter your own revision prompt..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={!aiPrompt.trim()}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Revise
                      </motion.button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  Click the button below to receive AI suggestions
                </div>
              )}

              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsAiModalOpen(false)}
                  className="px-6 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  Close
                </motion.button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
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