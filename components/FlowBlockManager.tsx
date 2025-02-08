'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { FlowBlock, FlowBlockTiming, TimingPattern, DEFAULT_TIMING_PATTERN, FLOW_BLOCK_CATEGORIES } from '@/lib/types/flow-blocks';
import { YogaPose } from '@/lib/data/poses';
import BilateralPoseCard from './BilateralPoseCard';
import PoseModal from './PoseModal';
import { Dialog } from '@headlessui/react';
import { PlusIcon, ShareIcon, ArrowLeftIcon, ArrowRightIcon, XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';

interface FlowBlockManagerProps {
  onSelectFlowBlock?: (flowBlock: FlowBlock) => void;
  mode?: 'select' | 'manage';
  className?: string;
  selectedCategory?: string;
  parentBlockId?: number;
}

type WizardStep = 'info' | 'poses' | 'timing' | 'review';

export default function FlowBlockManager({ 
  onSelectFlowBlock, 
  mode = 'manage',
  className = '',
  selectedCategory,
  parentBlockId
}: FlowBlockManagerProps) {
  const [flowBlocks, setFlowBlocks] = useState<FlowBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBlockDetails, setNewBlockDetails] = useState({
    name: '',
    description: '',
    category: selectedCategory || FLOW_BLOCK_CATEGORIES[0],
    difficulty_level: 'Intermediate' as 'Beginner' | 'Intermediate' | 'Expert',
    is_bilateral: false,
    is_public: false
  });
  const [selectedPoses, setSelectedPoses] = useState<YogaPose[]>([]);
  const [showPoseModal, setShowPoseModal] = useState(false);
  const [timingPattern, setTimingPattern] = useState<TimingPattern>(DEFAULT_TIMING_PATTERN);
  const [poseTimings, setPoseTimings] = useState<Record<number, FlowBlockTiming>>({});
  const [currentStep, setCurrentStep] = useState<WizardStep>('info');
  const [showPosePanel, setShowPosePanel] = useState(false);
  const [selectedPoseForDetails, setSelectedPoseForDetails] = useState<YogaPose | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPoseCategory, setSelectedPoseCategory] = useState<string>('');
  const [selectedPoseLevel, setSelectedPoseLevel] = useState<string>('');
  const [poses, setPoses] = useState<YogaPose[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    loadFlowBlocks();
    const loadPoses = async () => {
      const { data: posesData } = await supabase
        .from('poses')
        .select('*')
        .order('english_name');
      if (posesData) {
        setPoses(posesData);
      }
    };
    loadPoses();
  }, [selectedCategory, parentBlockId]);

  const loadFlowBlocks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('flow_blocks')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      if (parentBlockId !== undefined) {
        query = query.eq('parent_block_id', parentBlockId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setFlowBlocks(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading flow blocks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFlowBlock = async () => {
    try {
      // Clear any previous errors
      setError(null);

      // Validate required fields
      if (!newBlockDetails.name.trim()) {
        toast.error('Please enter a name for the flow block');
        setCurrentStep('info');
        return;
      }

      if (selectedPoses.length === 0) {
        toast.error('Please add at least one pose to the flow block');
        setCurrentStep('poses');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to create flow blocks');
        return;
      }

      // Format the data for saving
      const newBlock = {
        name: newBlockDetails.name.trim(),
        description: newBlockDetails.description.trim(),
        category: newBlockDetails.category,
        difficulty_level: newBlockDetails.difficulty_level,
        is_bilateral: newBlockDetails.is_bilateral,
        is_public: newBlockDetails.is_public,
        poses: selectedPoses.map(pose => ({
          id: pose.id,
          english_name: pose.english_name,
          sanskrit_name: pose.sanskrit_name,
          difficulty_level: pose.difficulty_level,
          category_name: pose.category_name
        })),
        timing: poseTimings,
        timing_pattern: timingPattern,
        user_id: session.user.id,
        parent_block_id: parentBlockId || null
      };

      // Save to Supabase
      const { data, error: saveError } = await supabase
        .from('flow_blocks')
        .insert([newBlock])
        .select()
        .single();

      if (saveError) {
        console.error('Error saving flow block:', saveError);
        throw new Error(saveError.message);
      }

      if (!data) {
        throw new Error('No data returned from save operation');
      }

      // Update local state
      setFlowBlocks(prev => [data, ...prev]);
      
      // Show success message
      toast.success('Flow block created successfully');
      
      // Reset and close modal
      setShowCreateModal(false);
      resetForm();
    } catch (err: any) {
      console.error('Error creating flow block:', err);
      toast.error(err.message || 'Failed to create flow block');
    }
  };

  const handlePoseSelect = (pose: YogaPose) => {
    setSelectedPoses([...selectedPoses, pose]);
    
    // Create default timing for the pose
    setPoseTimings({
      ...poseTimings,
      [pose.id]: {
        pose_id: Number(pose.id),
        duration: '5 breaths',
        transition_in: '',
        transition_out: '',
        bilateral_note: newBlockDetails.is_bilateral ? 'Repeat on other side' : undefined
      }
    });

    setShowPoseModal(false);
  };

  const handleRemovePose = (index: number) => {
    const newPoses = [...selectedPoses];
    const removedPose = newPoses[index];
    newPoses.splice(index, 1);
    setSelectedPoses(newPoses);

    // Remove timing for the pose
    const newTimings = { ...poseTimings };
    delete newTimings[Number(removedPose.id)];
    setPoseTimings(newTimings);
  };

  const handleUpdatePoseTiming = (poseId: number, timing: Partial<FlowBlockTiming>) => {
    setPoseTimings({
      ...poseTimings,
      [poseId]: {
        ...poseTimings[poseId],
        ...timing
      }
    });
  };

  const resetForm = () => {
    setNewBlockDetails({
      name: '',
      description: '',
      category: selectedCategory || FLOW_BLOCK_CATEGORIES[0],
      difficulty_level: 'Intermediate',
      is_bilateral: false,
      is_public: false
    });
    setSelectedPoses([]);
    setPoseTimings({});
    setTimingPattern(DEFAULT_TIMING_PATTERN);
    setError(null);
  };

  const handleCategoryFilter = (category?: string | null) => {
    // Just trigger a reload with the current category
    loadFlowBlocks();
  };

  const filteredPoses = searchQuery || selectedPoseCategory || selectedPoseLevel
    ? poses.filter(p => {
        const matchesSearch = !searchQuery || 
          p.english_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sanskrit_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedPoseCategory || p.category_name === selectedPoseCategory;
        const matchesLevel = !selectedPoseLevel || p.difficulty_level === selectedPoseLevel;
        return matchesSearch && matchesCategory && matchesLevel;
      })
    : poses;

  const categories = Array.from(new Set(poses.map(p => p.category_name)));
  const levels = ['Beginner', 'Intermediate', 'Expert'];

  const handlePoseReorder = (startIndex: number, endIndex: number) => {
    const newPoses = [...selectedPoses];
    const [removed] = newPoses.splice(startIndex, 1);
    newPoses.splice(endIndex, 0, removed);
    setSelectedPoses(newPoses);
  };

  const handlePoseTimingChange = (poseId: number, field: keyof FlowBlockTiming, value: string) => {
    setPoseTimings({
      ...poseTimings,
      [poseId]: {
        ...poseTimings[poseId],
        [field]: value
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Flow Blocks</h2>
          <p className="text-muted-foreground">
            Create and manage reusable flow sequences
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Create Flow Block
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          onClick={() => handleCategoryFilter(null)}
          className="whitespace-nowrap"
        >
          All Categories
        </Button>
        {FLOW_BLOCK_CATEGORIES.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => handleCategoryFilter(category)}
            className="whitespace-nowrap"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Flow Blocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Create New Block Card */}
        <motion.button
          onClick={() => setShowCreateModal(true)}
          className="h-40 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center text-white/40 hover:text-white/60 hover:border-white/20 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-lg">Create New Flow Block</span>
        </motion.button>

        {/* Existing Flow Blocks */}
        {flowBlocks.map((block) => (
          <motion.div
            key={block.id}
            className="relative p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            onClick={() => onSelectFlowBlock?.(block)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <h3 className="text-lg font-medium">{block.name}</h3>
            {block.description && (
              <p className="mt-1 text-sm text-muted-foreground">{block.description}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="px-2 py-1 text-xs rounded bg-primary/20 text-primary-foreground">
                {block.difficulty_level}
              </span>
              {block.is_bilateral && (
                <span className="px-2 py-1 text-xs rounded bg-accent/20 text-accent-foreground">
                  Bilateral
                </span>
              )}
              {block.category && (
                <span className="px-2 py-1 text-xs rounded bg-secondary/20 text-secondary-foreground">
                  {block.category}
                </span>
              )}
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              {block.poses.length} poses
            </div>
          </motion.div>
        ))}
      </div>

      {/* Creation Wizard Modal */}
      <Dialog
        open={showCreateModal}
        onClose={() => {
          if (selectedPoseForDetails) {
            setSelectedPoseForDetails(null);
          } else {
            setShowCreateModal(false);
            resetForm();
          }
        }}
        className="fixed inset-0 z-[75] overflow-y-auto"
      >
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-4xl bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-white/10 shadow-2xl"
          >
            {/* Wizard Header */}
            <div className="relative bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 p-6">
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-white">Create Flow Block</h2>
                  <p className="text-white/60 mt-1">
                    {currentStep === 'info' && 'Basic Information'}
                    {currentStep === 'poses' && 'Select Poses'}
                    {currentStep === 'timing' && 'Set Timing'}
                    {currentStep === 'review' && 'Review & Save'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              {/* Progress Bar */}
              <div className="grid grid-cols-4 gap-2 mt-6">
                {(['info', 'poses', 'timing', 'review'] as WizardStep[]).map((step, index) => (
                  <div
                    key={step}
                    className={`h-1 rounded-full transition-colors ${
                      currentStep === step
                        ? 'bg-blue-500'
                        : index < ['info', 'poses', 'timing', 'review'].indexOf(currentStep)
                        ? 'bg-blue-500/50'
                        : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Wizard Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {currentStep === 'poses' ? (
                  <motion.div
                    key="poses"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Selected Poses */}
                    {selectedPoses.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white">Selected Poses</h3>
                        <div className="space-y-2">
                          {selectedPoses.map((pose, index) => (
                            <motion.div
                              key={`selected-pose-${pose.id}-${index}`}
                              layoutId={`pose-${pose.id}-${index}`}
                              className="bg-white/5 border-2 border-white/10 rounded-xl p-4 flex items-center gap-4"
                              drag="y"
                              dragConstraints={{ top: 0, bottom: 0 }}
                              onDragStart={() => setIsDragging(true)}
                              onDragEnd={(e, info) => {
                                setIsDragging(false);
                                const distance = info.offset.y;
                                const moveBy = Math.round(distance / 72);
                                if (moveBy !== 0) {
                                  const newIndex = Math.max(0, Math.min(selectedPoses.length - 1, index + moveBy));
                                  handlePoseReorder(index, newIndex);
                                }
                              }}
                            >
                              <div className="flex-1">
                                <h4 className="font-bold text-white">{pose.english_name}</h4>
                                <p className="text-white/60 text-sm">{pose.sanskrit_name}</p>
                                
                                {/* Inline timing editor */}
                                <div className="mt-2 flex items-center gap-4">
                                  <div className="flex-1">
                                    <input
                                      type="text"
                                      value={poseTimings[Number(pose.id)]?.duration || ''}
                                      onChange={(e) => handlePoseTimingChange(Number(pose.id), 'duration', e.target.value)}
                                      placeholder="Duration (e.g., 5 breaths)"
                                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-white placeholder-white/40"
                                    />
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <div 
                                  className="p-2 cursor-move touch-none"
                                  onMouseDown={() => setIsDragging(true)}
                                  onMouseUp={() => setIsDragging(false)}
                                >
                                  <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                  </svg>
                                </div>
                                <div
                                  onClick={() => handleRemovePose(index)}
                                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400 hover:text-red-300 cursor-pointer"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pose Search */}
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search poses..."
                          className="flex-1 bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40"
                        />
                        <select
                          value={selectedPoseCategory}
                          onChange={(e) => setSelectedPoseCategory(e.target.value)}
                          className="bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white appearance-none cursor-pointer"
                        >
                          <option value="">All Categories</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>

                      {/* Available Poses Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto">
                        {filteredPoses.map((pose, index) => (
                          <div
                            key={`available-pose-${pose.id}-${index}`}
                            onClick={() => handlePoseSelect(pose)}
                            className="bg-white/5 border-2 border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            <h4 className="font-bold text-white">{pose.english_name}</h4>
                            <p className="text-white/60 text-sm">{pose.sanskrit_name}</p>
                            <div className="mt-2 flex gap-2">
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                {pose.difficulty_level}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : currentStep === 'info' ? (
                  <motion.div
                    key="info"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Basic Info Form */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">
                        Name
                      </label>
                      <input
                        type="text"
                        value={newBlockDetails.name}
                        onChange={(e) => setNewBlockDetails({ ...newBlockDetails, name: e.target.value })}
                        className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="e.g., Sun Salutation A"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">
                        Description
                      </label>
                      <textarea
                        value={newBlockDetails.description}
                        onChange={(e) => setNewBlockDetails({ ...newBlockDetails, description: e.target.value })}
                        className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        rows={3}
                        placeholder="Describe the flow and its benefits..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-white">
                          Category
                        </label>
                        <select
                          value={newBlockDetails.category}
                          onChange={(e) => setNewBlockDetails({ ...newBlockDetails, category: e.target.value })}
                          className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-4 text-white appearance-none cursor-pointer hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                          {FLOW_BLOCK_CATEGORIES.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-white">
                          Difficulty Level
                        </label>
                        <select
                          value={newBlockDetails.difficulty_level}
                          onChange={(e) => setNewBlockDetails({ 
                            ...newBlockDetails, 
                            difficulty_level: e.target.value as 'Beginner' | 'Intermediate' | 'Expert'
                          })}
                          className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-4 text-white appearance-none cursor-pointer hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Expert">Expert</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-white">
                        <input
                          type="checkbox"
                          checked={newBlockDetails.is_bilateral}
                          onChange={(e) => setNewBlockDetails({ ...newBlockDetails, is_bilateral: e.target.checked })}
                          className="w-5 h-5 rounded border-2 border-white/10 bg-white/5 checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                        />
                        <span>Bilateral Flow</span>
                      </label>
                      <label className="flex items-center gap-2 text-white">
                        <input
                          type="checkbox"
                          checked={newBlockDetails.is_public}
                          onChange={(e) => setNewBlockDetails({ ...newBlockDetails, is_public: e.target.checked })}
                          className="w-5 h-5 rounded border-2 border-white/10 bg-white/5 checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                        />
                        <span>Make Public</span>
                      </label>
                    </div>
                  </motion.div>
                ) : currentStep === 'timing' ? (
                  <motion.div
                    key="timing"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-white">Default Round</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">
                            Duration Type
                          </label>
                          <select
                            value={timingPattern.default_round.duration_type}
                            onChange={(e) => setTimingPattern({
                              ...timingPattern,
                              default_round: {
                                ...timingPattern.default_round,
                                duration_type: e.target.value as 'breath' | 'seconds'
                              }
                            })}
                            className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-4 text-white appearance-none cursor-pointer hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          >
                            <option value="breath">Breaths</option>
                            <option value="seconds">Seconds</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">
                            Count
                          </label>
                          <input
                            type="number"
                            value={timingPattern.default_round.count}
                            onChange={(e) => setTimingPattern({
                              ...timingPattern,
                              default_round: {
                                ...timingPattern.default_round,
                                count: parseInt(e.target.value)
                              }
                            })}
                            className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            min="1"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="bg-white/5 border-2 border-white/10 rounded-xl p-5">
                        <h3 className="text-xl font-bold text-white">{newBlockDetails.name}</h3>
                        <p className="text-white/60 mt-1">{newBlockDetails.description}</p>
                        <div className="flex gap-2 mt-4">
                          <span className="px-3 py-1 text-sm font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {newBlockDetails.difficulty_level}
                          </span>
                          <span className="px-3 py-1 text-sm font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {newBlockDetails.category}
                          </span>
                          {newBlockDetails.is_bilateral && (
                            <span className="px-3 py-1 text-sm font-bold rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                              Bilateral
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-lg font-bold text-white">Selected Poses ({selectedPoses.length})</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {selectedPoses.map((pose, index) => (
                            <div
                              key={`selected-pose-${pose.id}-${index}`}
                              className="bg-white/5 border-2 border-white/10 rounded-xl p-4"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-bold text-white">{pose.english_name}</h5>
                                  <p className="text-white/60">{pose.sanskrit_name}</p>
                                </div>
                                <span className="text-white/40">#{index + 1}</span>
                              </div>
                              {poseTimings[Number(pose.id)] && (
                                <div className="mt-2 pt-2 border-t-2 border-white/10">
                                  <p className="text-white/60 text-sm">
                                    Duration: {poseTimings[Number(pose.id)].duration}
                                  </p>
                                  {poseTimings[Number(pose.id)].bilateral_note && (
                                    <p className="text-white/60 text-sm">
                                      {poseTimings[Number(pose.id)].bilateral_note}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wizard Navigation */}
            <div className="p-6 bg-white/5 border-t-2 border-white/10 flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  const steps: WizardStep[] = ['info', 'poses', 'timing', 'review'];
                  const currentIndex = steps.indexOf(currentStep);
                  if (currentIndex > 0) {
                    setCurrentStep(steps[currentIndex - 1]);
                  }
                }}
                disabled={currentStep === 'info'}
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Previous
              </Button>
              
              <Button
                onClick={() => {
                  const steps: WizardStep[] = ['info', 'poses', 'timing', 'review'];
                  const currentIndex = steps.indexOf(currentStep);
                  if (currentStep === 'review') {
                    handleCreateFlowBlock();
                  } else if (currentIndex < steps.length - 1) {
                    setCurrentStep(steps[currentIndex + 1]);
                  }
                }}
                className="flex items-center gap-2"
              >
                {currentStep === 'review' ? (
                  <>
                    Save Flow Block
                    <ShareIcon className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRightIcon className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>

          {/* Pose Details Slide-out Panel */}
          <AnimatePresence>
            {selectedPoseForDetails && (
              <motion.div
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '100%' }}
                className="fixed inset-y-0 right-0 w-full max-w-2xl bg-gray-900/90 backdrop-blur-lg border-l-2 border-white/10 shadow-2xl overflow-y-auto"
              >
                <div className="sticky top-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 p-6 z-10">
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative flex justify-between items-start">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold text-white">{selectedPoseForDetails.english_name}</h2>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl text-white/80">{selectedPoseForDetails.sanskrit_name}</h3>
                        {selectedPoseForDetails.sanskrit_name_adapted && (
                          <span className="text-white/60">({selectedPoseForDetails.sanskrit_name_adapted})</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPoseForDetails(null)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Pose Details Content */}
                  <div className="grid gap-6">
                    <div className="bg-white/5 border-2 border-white/10 rounded-xl p-5">
                      <h4 className="text-lg font-bold text-blue-400 mb-3">Description</h4>
                      <p className="text-white/80 leading-relaxed">{selectedPoseForDetails.pose_description}</p>
                    </div>

                    {selectedPoseForDetails.pose_benefits && (
                      <div className="bg-white/5 border-2 border-white/10 rounded-xl p-5">
                        <h4 className="text-lg font-bold text-pink-400 mb-3">Benefits</h4>
                        <p className="text-white/80 leading-relaxed">{selectedPoseForDetails.pose_benefits}</p>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => {
                      handlePoseSelect(selectedPoseForDetails);
                      setSelectedPoseForDetails(null);
                    }}
                    className="w-full"
                  >
                    Add to Flow Block
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Dialog>
    </div>
  );
} 