'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { ArrowPathIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { YogaPose } from '@/lib/data/poses';
import PoseModal from './PoseModal';

interface SequencePoseManagerProps {
  poses: YogaPose[] | null;
  allPoses: YogaPose[];
  level: string;
  onPosesChange: (poses: YogaPose[]) => void;
  peakPoses: YogaPose[];
  setPeakPoses: (poses: YogaPose[]) => void;
  timing?: string[];
  transitions?: string[];
  repetitions?: {
    [key: string]: {
      repeat: number;
      note: string;
    };
  };
  enabledFeatures?: {
    timing?: boolean;
    transitions?: boolean;
    cues?: boolean;
  };
  onEnabledFeaturesChange?: (features: {
    timing?: boolean;
    transitions?: boolean;
    cues?: boolean;
  }) => void;
}

export default function SequencePoseManager({
  poses: rawPoses,
  allPoses,
  level,
  onPosesChange,
  peakPoses,
  setPeakPoses,
  timing = [],
  transitions = [],
  repetitions = {},
  enabledFeatures = {},
  onEnabledFeaturesChange
}: SequencePoseManagerProps) {
  const parsePoses = (poses: YogaPose[] | string | null): YogaPose[] => {
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

  const poses = parsePoses(rawPoses);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [selectedPoseIndex, setSelectedPoseIndex] = useState<number | null>(null);
  const [suggestedPoses, setSuggestedPoses] = useState<YogaPose[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestedAddPoses, setSuggestedAddPoses] = useState<{
    poses: YogaPose[];
    explanations: string[];
  }>({ poses: [], explanations: [] });
  const [isLoadingAddSuggestions, setIsLoadingAddSuggestions] = useState(false);
  const [isLoadingReplaceSuggestions, setIsLoadingReplaceSuggestions] = useState(false);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(poses);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onPosesChange(items);
  };

  const handleReplacePose = async (index: number) => {
    setSelectedPoseIndex(index);
    if (!poses) return;
    const currentPose = poses[index];
    
    // Immediately show current pose and all compatible poses
    const compatiblePoses = allPoses.filter(p => 
      !peakPoses.some(peak => peak.id === p.id) &&
      !poses.some(pose => pose.id === p.id)
    );

    // Start with current pose and compatible poses
    setSuggestedPoses([currentPose, ...compatiblePoses]);
    setIsReplaceModalOpen(true);
    setIsLoadingReplaceSuggestions(true);

    // Make API call to get AI suggestions
    try {
      const response = await fetch('/api/suggest-pose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_pose: {
            name: currentPose.english_name,
            sanskrit_name: currentPose.sanskrit_name,
            difficulty: currentPose.difficulty_level,
            category: currentPose.category_name,
            description: currentPose.pose_description
          },
          sequence: poses,
          available_poses: compatiblePoses
        }),
      });

      if (!response.ok) throw new Error('Failed to get suggestions');
      
      const data = await response.json();
      if (data.pose_id) {
        // Find the suggested pose
        const suggestedPose = compatiblePoses.find(p => p.id === data.pose_id);
        if (suggestedPose) {
          // Move the suggested pose to the top of the list (after current pose)
          const newSuggestedPoses = [
            currentPose,
            suggestedPose,
            ...compatiblePoses.filter(p => p.id !== suggestedPose.id)
          ];
          setSuggestedPoses(newSuggestedPoses);
        }
      }
    } catch (error) {
      console.error('Error getting pose suggestions:', error);
      // Keep showing the compatible poses even if AI suggestion fails
    } finally {
      setIsLoadingReplaceSuggestions(false);
    }
  };

  const handlePoseSelect = (pose: YogaPose) => {
    if (selectedPoseIndex !== null && poses) {
      // Only update if a different pose was selected
      if (poses[selectedPoseIndex].id !== pose.id) {
        const newPoses = [...poses];
        const oldPose = newPoses[selectedPoseIndex];
        newPoses[selectedPoseIndex] = pose;
        onPosesChange(newPoses);

        // If the replaced pose was a peak pose, update peak poses list
        if (peakPoses.some(p => p.id === oldPose.id)) {
          const newPeakPoses = peakPoses.filter(p => p.id !== oldPose.id);
          setPeakPoses(newPeakPoses);
        }
      }
      setIsReplaceModalOpen(false);
      setSelectedPoseIndex(null);
      setSuggestedPoses([]);
    }
  };

  const handleAddPose = (pose: YogaPose) => {
    if (!poses) return;
    onPosesChange([...poses, pose]);
    setIsAddModalOpen(false);
    setSearchTerm('');
  };

  const handleRemovePose = (index: number) => {
    if (!poses) return;
    const newPoses = [...poses];
    newPoses.splice(index, 1);
    onPosesChange(newPoses);
  };

  const filteredPoses = allPoses.filter(pose => 
    pose.english_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pose.sanskrit_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddModal = async () => {
    setIsAddModalOpen(true);
    setIsLoadingAddSuggestions(true);
    
    // Get available poses (excluding current poses and peak poses)
    const availablePoses = allPoses.filter(p => 
      !poses?.some(pose => pose.id === p.id) &&
      !peakPoses.some(peak => peak.id === p.id)
    );

    // Make API call to get AI suggestions
    try {
      const response = await fetch('/api/suggest-add-pose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sequence: poses,
          available_poses: availablePoses,
          level
        }),
      });

      if (!response.ok) throw new Error('Failed to get suggestions');
      
      const data = await response.json();
      if (data.pose_ids && data.explanations) {
        // Find the suggested poses
        const suggestedPoses = data.pose_ids
          .map((id: number) => availablePoses.find(p => p.id === id))
          .filter((p: YogaPose | undefined): p is YogaPose => p !== undefined);

        setSuggestedAddPoses({
          poses: suggestedPoses,
          explanations: data.explanations
        });
      }
    } catch (error) {
      console.error('Error getting pose suggestions:', error);
      setSuggestedAddPoses({ poses: [], explanations: [] });
    } finally {
      setIsLoadingAddSuggestions(false);
    }
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setSearchTerm('');
    setSuggestedAddPoses({ poses: [], explanations: [] });
  };

  const handleToggleFeature = (feature: 'timing' | 'transitions' | 'cues', value: boolean) => {
    if (onEnabledFeaturesChange) {
      onEnabledFeaturesChange({
        ...enabledFeatures,
        [feature]: value
      });
    }
  };

  if (!poses.length) return null;

  return (
    <div className="space-y-4">
      {/* Feature toggles */}
      <div className="flex flex-wrap gap-3 p-4 bg-gray-800/50 rounded-xl border border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleToggleFeature('timing', !enabledFeatures.timing)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              enabledFeatures.timing
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30'
                : 'bg-gray-700/50 text-gray-400 border border-white/10 hover:bg-gray-700'
            }`}
          >
            {enabledFeatures.timing ? '✓ Timing' : 'Timing'}
          </button>
          <button
            onClick={() => handleToggleFeature('cues', !enabledFeatures.cues)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              enabledFeatures.cues
                ? 'bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30'
                : 'bg-gray-700/50 text-gray-400 border border-white/10 hover:bg-gray-700'
            }`}
          >
            {enabledFeatures.cues ? '✓ Cues' : 'Cues'}
          </button>
          <button
            onClick={() => handleToggleFeature('transitions', !enabledFeatures.transitions)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              enabledFeatures.transitions
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30'
                : 'bg-gray-700/50 text-gray-400 border border-white/10 hover:bg-gray-700'
            }`}
          >
            {enabledFeatures.transitions ? '✓ Transitions' : 'Transitions'}
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="poses">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-4 transition-colors duration-200 ${
                snapshot.isDraggingOver ? 'bg-white/5 rounded-xl p-4' : ''
              }`}
            >
              {poses?.map((pose, index) => (
                <Draggable 
                  key={`${pose.id}-${index}`}
                  draggableId={`${pose.id}-${index}`}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 cursor-move transition-transform duration-200 ${
                        peakPoses.some(p => p.id === pose.id) ? 'border-yellow-500/50 bg-yellow-500/10 ring-2 ring-yellow-500/20' : ''
                      } ${snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-500/20 scale-[1.02] rotate-1 z-10' : ''}`}
                      style={provided.draggableProps.style}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-medium text-white">{pose.english_name}</h3>
                            {peakPoses.some(p => p.id === pose.id) && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                                Peak Pose
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">{pose.sanskrit_name}</p>
                          <div className="mt-3 space-y-2">
                            {enabledFeatures.timing && timing[index] && (
                              <p className="text-sm text-blue-300/90 font-light">
                                Duration: {timing[index]}
                              </p>
                            )}
                            <div className="space-y-1">
                              <p className="text-sm text-gray-400">
                                {pose.pose_description}
                              </p>
                              {enabledFeatures.cues && Object.entries(repetitions).map(([key, value]) => {
                                if (key.split('-').map(Number).includes(pose.id)) {
                                  return (
                                    <p key={key} className="text-sm text-green-300/90 font-light">
                                      {value.note}
                                    </p>
                                  );
                                }
                                return null;
                              })}
                            </div>
                            {enabledFeatures.transitions && transitions[index] && (
                              <p className="text-sm text-purple-300/90 font-light">
                                Transition: {transitions[index]}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleReplacePose(index)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleRemovePose(index)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {pose.difficulty_level}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {pose.category_name}
                        </span>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <button
        onClick={handleOpenAddModal}
        className="w-full py-3 px-4 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Add Pose
      </button>

      {/* Add Pose Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">Add Pose</h3>
              <button
                onClick={handleCloseAddModal}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search poses..."
              className="w-full bg-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />

            <div className="max-h-96 overflow-y-auto space-y-4">
              {/* AI Suggested poses */}
              <div className="space-y-2">
                {isLoadingAddSuggestions ? (
                  // Loading placeholders
                  Array(2).fill(0).map((_, index) => (
                    <div
                      key={index}
                      className="w-full p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 animate-pulse"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-32 bg-white/10 rounded"></div>
                        <div className="h-5 w-20 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full"></div>
                      </div>
                      <div className="h-4 w-24 bg-white/10 rounded mb-2"></div>
                      <div className="h-4 w-48 bg-purple-500/10 rounded mb-2"></div>
                      <div className="flex gap-2">
                        <div className="h-5 w-16 bg-blue-500/10 rounded-full"></div>
                        <div className="h-5 w-20 bg-purple-500/10 rounded-full"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  suggestedAddPoses.poses.map((pose, index) => (
                    <motion.button
                      key={pose.id}
                      onClick={() => handleAddPose(pose)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full text-left p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 hover:from-purple-500/30 hover:to-blue-500/30 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-white">{pose.english_name}</h4>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30">
                          Suggested
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{pose.sanskrit_name}</p>
                      <p className="text-sm text-purple-300 mt-1">{suggestedAddPoses.explanations[index]}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {pose.difficulty_level}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {pose.category_name}
                        </span>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>

              {/* All other poses */}
              {filteredPoses
                .filter(p => !suggestedAddPoses.poses.some(sp => sp.id === p.id))
                .map((pose) => (
                  <motion.button
                    key={pose.id}
                    onClick={() => handleAddPose(pose)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full text-left p-4 rounded-xl bg-gray-700/50 hover:bg-gray-700 transition-colors"
                  >
                    <h4 className="font-medium text-white">{pose.english_name}</h4>
                    <p className="text-sm text-gray-400">{pose.sanskrit_name}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {pose.difficulty_level}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {pose.category_name}
                      </span>
                    </div>
                  </motion.button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Replace Pose Modal */}
      {isReplaceModalOpen && (
        <PoseModal
          poses={allPoses}
          suggestedPoses={suggestedPoses}
          isLoadingSuggestions={isLoadingReplaceSuggestions}
          onClose={() => {
            setIsReplaceModalOpen(false);
            setSelectedPoseIndex(null);
            setSuggestedPoses([]);
          }}
          onSelect={handlePoseSelect}
        />
      )}
    </div>
  );
} 