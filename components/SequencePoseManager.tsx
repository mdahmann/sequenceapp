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
          <button
            onClick={() => handleToggleFeature('descriptions', !enabledFeatures.descriptions)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              enabledFeatures.descriptions
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/30'
                : 'bg-gray-700/50 text-gray-400 border border-white/10 hover:bg-gray-700'
            }`}
          >
            {enabledFeatures.descriptions ? '✓ Descriptions' : 'Descriptions'}
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
                            {isCustomPose(pose) && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                                Custom Pose
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">{pose.sanskrit_name}</p>
                          <div className="mt-3 space-y-2">
                            {enabledFeatures.descriptions && (
                              <p className="text-sm text-yellow-300/90 font-light">
                                {pose.pose_description}
                              </p>
                            )}
                            {enabledFeatures.timing && timing[index] && (
                              <p className="text-sm text-blue-300/90 font-light">
                                Duration: {timing[index]}
                              </p>
                            )}
                            {enabledFeatures.transitions && transitions[index] && (
                              <p className="text-sm text-purple-300/90 font-light">
                                Transition: {transitions[index]}
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
                            <ArrowPathIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleRemovePose(index)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                          >
                            <TrashIcon className="w-5 h-5" />
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

      <button
        onClick={handleOpenAddModal}
        className="w-full py-3 px-4 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
      >
        <PlusIcon className="w-5 h-5" />
        Add Pose
      </button>

      {/* Add Pose Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Add Pose</h2>
              <button
                onClick={handleCloseAddModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search poses..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-6"
            />

            <div className="max-h-[calc(100vh-16rem)] overflow-y-auto">
              <div className="space-y-6">
                {/* AI Suggested poses */}
                {isLoadingAddSuggestions ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array(2).fill(0).map((_, index) => (
                      <div
                        key={`loading-${index}`}
                        className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-4 animate-pulse"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-6 w-32 bg-white/10 rounded"></div>
                          <div className="h-5 w-20 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full"></div>
                        </div>
                        <div className="h-4 w-24 bg-white/10 rounded mb-2"></div>
                        <div className="flex gap-2">
                          <div className="h-5 w-16 bg-blue-500/10 rounded-full"></div>
                          <div className="h-5 w-20 bg-purple-500/10 rounded-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {suggestedAddPoses.poses.map((pose, index) => (
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
                    ))}
                  </div>
                )}

                {/* All other poses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {allPoses
                    .filter(p => 
                      !poses?.some(pose => pose.id === p.id) &&
                      !peakPoses.some(peak => peak.id === p.id) &&
                      !suggestedAddPoses.poses.some(sp => sp.id === p.id) &&
                      (searchTerm === '' || 
                        p.english_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.sanskrit_name.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map((pose) => (
                      <motion.button
                        key={pose.id}
                        onClick={() => handleAddPose(pose)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full text-left p-4 rounded-xl bg-gray-700/50 hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white">{pose.english_name}</h4>
                          {isCustomPose(pose) && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                              Custom Pose
                            </span>
                          )}
                        </div>
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