'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { ArrowPathIcon, TrashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
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
    descriptions?: boolean;
  };
  onEnabledFeaturesChange?: (features: {
    timing?: boolean;
    transitions?: boolean;
    cues?: boolean;
    descriptions?: boolean;
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
  const [selectedPoseIndex, setSelectedPoseIndex] = useState<number | null>(null);
  const [suggestedPoses, setSuggestedPoses] = useState<YogaPose[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestedAddPoses, setSuggestedAddPoses] = useState<{
    poses: YogaPose[];
    explanations: string[];
  }>({ poses: [], explanations: [] });
  const [isLoadingAddSuggestions, setIsLoadingAddSuggestions] = useState(false);
  const [isLoadingReplaceSuggestions, setIsLoadingReplaceSuggestions] = useState(false);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !poses) return;

    const items = Array.from(poses);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onPosesChange(items);
  };

  const handleReplacePose = async (index: number) => {
    setSelectedPoseIndex(index);
    if (!poses) return;
    const currentPose = poses[index];
    
    // Get compatible poses
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

  const handleToggleFeature = (feature: 'timing' | 'transitions' | 'cues' | 'descriptions', value: boolean) => {
    if (onEnabledFeaturesChange) {
      onEnabledFeaturesChange({
        ...enabledFeatures,
        [feature]: value
      });
    }
  };

  const isCustomPose = (pose: YogaPose) => {
    return 'user_id' in pose;
  };

  if (!poses.length) return null;

  return (
    <div className="space-y-6">
      {/* Feature Toggles */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => handleToggleFeature('timing', !enabledFeatures.timing)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            enabledFeatures.timing
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : 'bg-white/5 text-gray-400 border border-white/10'
          }`}
        >
          Timing
        </button>
        <button
          onClick={() => handleToggleFeature('transitions', !enabledFeatures.transitions)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            enabledFeatures.transitions
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'bg-white/5 text-gray-400 border border-white/10'
          }`}
        >
          Transitions
        </button>
        <button
          onClick={() => handleToggleFeature('cues', !enabledFeatures.cues)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            enabledFeatures.cues
              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
              : 'bg-white/5 text-gray-400 border border-white/10'
          }`}
        >
          Cues
        </button>
        <button
          onClick={() => handleToggleFeature('descriptions', !enabledFeatures.descriptions)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            enabledFeatures.descriptions
              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
              : 'bg-white/5 text-gray-400 border border-white/10'
          }`}
        >
          Descriptions
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="poses">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-2 transition-colors duration-200 ${
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
                      className={`bg-white/5 border border-white/10 rounded-xl p-3 cursor-move transition-transform duration-200 ${
                        peakPoses.some(p => p.id === pose.id) ? 'border-yellow-500/50 bg-yellow-500/10' : ''
                      } ${snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-500/20 scale-[1.02] rotate-1 z-10' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-medium text-white truncate">{pose.english_name}</h3>
                            {peakPoses.some(p => p.id === pose.id) && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 whitespace-nowrap">
                                Peak
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 truncate">{pose.sanskrit_name}</p>
                          
                          {/* Collapsible Details */}
                          {enabledFeatures.descriptions && (
                            <p className="mt-2 text-sm text-yellow-300/90 font-light line-clamp-2">
                              {pose.pose_description}
                            </p>
                          )}
                          
                          <div className="mt-2 space-y-1">
                            {enabledFeatures.timing && timing[index] && (
                              <p className="text-sm text-blue-300/90 font-light">
                                {timing[index]}
                              </p>
                            )}
                            {enabledFeatures.transitions && transitions[index] && (
                              <p className="text-sm text-purple-300/90 font-light">
                                {transitions[index]}
                              </p>
                            )}
                            {enabledFeatures.cues && repetitions[index] && (
                              <p className="text-sm text-green-300/90 font-light">
                                {repetitions[index].note}
                                {repetitions[index].repeat > 1 && (
                                  <span className="text-gray-500"> (x{repetitions[index].repeat})</span>
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReplacePose(index)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleRemovePose(index)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
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

      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenAddModal}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl px-6 py-3 font-medium hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
        >
          Add Pose
        </motion.button>
      </div>

      {/* Add Pose Modal */}
      {isAddModalOpen && (
        <PoseModal
          poses={allPoses.filter(p => 
            !poses?.some(existingPose => existingPose.id === p.id) &&
            !peakPoses.some(peakPose => peakPose.id === p.id)
          )}
          onClose={() => setIsAddModalOpen(false)}
          onSelect={handleAddPose}
          mode="select"
        />
      )}

      {/* Replace Pose Modal */}
      {isReplaceModalOpen && (
        <PoseModal
          poses={allPoses.filter(p => !peakPoses.some(peak => peak.id === p.id))}
          suggestedPoses={suggestedPoses}
          isLoadingSuggestions={isLoadingReplaceSuggestions}
          onClose={() => {
            setIsReplaceModalOpen(false);
            setSelectedPoseIndex(null);
            setSuggestedPoses([]);
          }}
          onSelect={handlePoseSelect}
          mode="replace"
        />
      )}
    </div>
  );
} 