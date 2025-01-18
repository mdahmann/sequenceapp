'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { ArrowPathIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { YogaPose } from '@/lib/data/poses';
import PoseModal from './PoseModal';

interface SequencePoseManagerProps {
  poses: YogaPose[];
  allPoses: YogaPose[];
  level: string;
  onPosesChange: (poses: YogaPose[]) => void;
  peakPoses?: YogaPose[];
  setPeakPoses?: (poses: YogaPose[]) => void;
}

export default function SequencePoseManager({
  poses,
  allPoses,
  level,
  onPosesChange,
  peakPoses = [],
  setPeakPoses
}: SequencePoseManagerProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [selectedPoseIndex, setSelectedPoseIndex] = useState<number | null>(null);
  const [suggestedPoses, setSuggestedPoses] = useState<YogaPose[]>([]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(poses);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    onPosesChange(items);
  };

  const handleReplacePose = (index: number) => {
    setSelectedPoseIndex(index);
    // Get the current pose
    const currentPose = poses[index];
    
    // Find poses of similar difficulty and category
    const similarPoses = allPoses.filter(p => 
      p.difficulty_level === currentPose.difficulty_level &&
      p.category_name === currentPose.category_name &&
      p.id !== currentPose.id &&
      !peakPoses.some(peak => peak.id === p.id) &&
      !poses.some(pose => pose.id === p.id)
    );

    // Find poses of same difficulty but different category
    const sameDifficultyPoses = allPoses.filter(p => 
      p.difficulty_level === currentPose.difficulty_level &&
      p.category_name !== currentPose.category_name &&
      p.id !== currentPose.id &&
      !peakPoses.some(peak => peak.id === p.id) &&
      !poses.some(pose => pose.id === p.id)
    );

    // Combine and limit suggestions
    const suggestions = [
      ...similarPoses.slice(0, 1),  // One pose from same category
      ...sameDifficultyPoses.slice(0, 1)  // One pose from different category
    ].sort(() => Math.random() - 0.5);

    setSuggestedPoses([currentPose, ...suggestions]);
    setIsReplaceModalOpen(true);
  };

  const handlePoseSelect = (pose: YogaPose) => {
    if (selectedPoseIndex !== null) {
      // Only update if a different pose was selected
      if (poses[selectedPoseIndex].id !== pose.id) {
        const newPoses = [...poses];
        const oldPose = newPoses[selectedPoseIndex];
        newPoses[selectedPoseIndex] = pose;
        onPosesChange(newPoses);

        // If the replaced pose was a peak pose, update peak poses list
        if (peakPoses.some(p => p.id === oldPose.id) && setPeakPoses) {
          const newPeakPoses = peakPoses.filter(p => p.id !== oldPose.id);
          setPeakPoses(newPeakPoses);
        }
      }
      setIsReplaceModalOpen(false);
      setSelectedPoseIndex(null);
      setSuggestedPoses([]);
    } else {
      onPosesChange([...poses, pose]);
      setIsAddModalOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="poses">
          {(provided: DroppableProvided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-4 transition-colors duration-200 ${
                snapshot.isDraggingOver ? 'bg-white/5 rounded-xl p-4' : ''
              }`}
            >
              {poses.map((pose, index) => (
                <Draggable 
                  key={`${pose.id}-${index}`} 
                  draggableId={`${pose.id}-${index}`} 
                  index={index}
                >
                  {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
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
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleReplacePose(index)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                          >
                            <ArrowPathIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              const newPoses = [...poses];
                              newPoses.splice(index, 1);
                              onPosesChange(newPoses);
                            }}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                          >
                            <TrashIcon className="w-5 h-5" />
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
        onClick={() => setIsAddModalOpen(true)}
        className="w-full py-3 px-4 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
      >
        <PlusIcon className="w-5 h-5" />
        Add Pose
      </button>

      {isAddModalOpen && (
        <PoseModal
          poses={allPoses.filter(p => !peakPoses.some(peak => peak.id === p.id))}
          onClose={() => setIsAddModalOpen(false)}
          onSelect={handlePoseSelect}
        />
      )}

      {isReplaceModalOpen && (
        <PoseModal
          poses={allPoses.filter(p => 
            p.difficulty_level === level &&
            !peakPoses.some(peak => peak.id === p.id) &&
            !poses.some(pose => pose.id === p.id)
          )}
          suggestedPoses={suggestedPoses}
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