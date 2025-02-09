import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ArrowPathIcon, TrashIcon, PlusIcon, Squares2X2Icon, BookmarkIcon } from '@heroicons/react/24/outline';
import type { YogaPose } from '@/types/YogaPose';
import { FlowBlock } from '@/lib/types/flow-blocks';
import FlowBlockManager from './FlowBlockManager';
import { Dialog } from '@headlessui/react';
import { useState } from 'react';

interface SequenceBuilderProps {
  sequence: YogaPose[] | null;
  isLoading: boolean;
  duration: number;
  level: string;
  focus: string[];
  title?: string;
  onPosesChange?: (poses: YogaPose[]) => void;
  onReplacePose?: (index: number) => void;
  onRemovePose?: (index: number) => void;
  onSaveClick?: () => void;
  onRegenerateClick?: () => void;
  onAddPose?: (index: number) => void;
  onSaveAsFlowBlock?: (sectionPoses: YogaPose[], name: string, description?: string) => void;
  flowBlockReferences?: {
    id: number;
    flow_block_id: number;
    position: number;
    repetitions: number;
  }[];
  onFlowBlockAdd?: (flowBlock: FlowBlock, position: number) => void;
  onFlowBlockRemove?: (position: number) => void;
}

interface Section {
  name: string;
  poses: YogaPose[];
  startIndex: number;
  id: string;
  isCollapsed?: boolean;
}

interface SaveFlowBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description?: string) => void;
  sectionName: string;
}

function SaveFlowBlockModal({ isOpen, onClose, onSave, sectionName }: SaveFlowBlockModalProps) {
  const [name, setName] = useState(sectionName);
  const [description, setDescription] = useState('');

  const handleSave = () => {
    onSave(name, description);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="brutalist-card"
          >
            <Dialog.Title className="text-2xl font-bold mb-4">
              Save as Flow Block
            </Dialog.Title>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Flow Block Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter a name for your flow block"
                  className="brutalist-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description for your flow block"
                  className="brutalist-input h-24"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="brutalist-button-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="brutalist-button-primary"
                >
                  Save Flow Block
                </button>
              </div>
            </div>
          </motion.div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

export default function SequenceBuilder({ 
  sequence, 
  isLoading, 
  duration, 
  level, 
  focus,
  title,
  onPosesChange,
  onReplacePose,
  onRemovePose,
  onSaveClick,
  onRegenerateClick,
  onAddPose,
  onSaveAsFlowBlock,
  flowBlockReferences = [],
  onFlowBlockAdd,
  onFlowBlockRemove
}: SequenceBuilderProps) {
  const [isFlowBlockModalOpen, setIsFlowBlockModalOpen] = useState(false);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null);
  const [isSaveFlowBlockModalOpen, setIsSaveFlowBlockModalOpen] = useState(false);
  const [selectedSectionForSave, setSelectedSectionForSave] = useState<Section | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [draggingPoseId, setDraggingPoseId] = useState<string | null>(null);

  // Group poses into sections based on their category and position in sequence
  const sections: Section[] = sequence ? [
    {
      id: 'warm-up',
      name: 'Warm-up',
      poses: sequence.slice(0, Math.floor(sequence.length * 0.2)),
      startIndex: 0,
      isCollapsed: collapsedSections['warm-up']
    },
    {
      id: 'standing-poses',
      name: 'Standing Poses',
      poses: sequence.slice(
        Math.floor(sequence.length * 0.2),
        Math.floor(sequence.length * 0.6)
      ),
      startIndex: Math.floor(sequence.length * 0.2),
      isCollapsed: collapsedSections['standing-poses']
    },
    {
      id: 'peak-work',
      name: 'Peak Work',
      poses: sequence.slice(
        Math.floor(sequence.length * 0.6),
        Math.floor(sequence.length * 0.8)
      ),
      startIndex: Math.floor(sequence.length * 0.6),
      isCollapsed: collapsedSections['peak-work']
    },
    {
      id: 'cool-down',
      name: 'Cool Down',
      poses: sequence.slice(Math.floor(sequence.length * 0.8)),
      startIndex: Math.floor(sequence.length * 0.8),
      isCollapsed: collapsedSections['cool-down']
    }
  ] : [];

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleDragStart = (start: any) => {
    setIsDragging(true);
    setDraggingPoseId(start.draggableId);
  };

  const handleDragEnd = (result: DropResult) => {
    setIsDragging(false);
    setDraggingPoseId(null);

    if (!result.destination || !sequence || !onPosesChange) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    // Create a new array with all poses
    const newSequence = Array.from(sequence);
    
    // Remove the pose from the source index and insert at destination
    const [movedPose] = newSequence.splice(sourceIndex, 1);
    newSequence.splice(destinationIndex, 0, movedPose);

    // Update flow block references if they exist
    if (flowBlockReferences.length > 0) {
      flowBlockReferences.forEach(ref => {
        if (sourceIndex < ref.position && destinationIndex >= ref.position) {
          // Moving a pose from before the block to after it - decrease block position
          ref.position -= 1;
        } else if (sourceIndex > ref.position && destinationIndex <= ref.position) {
          // Moving a pose from after the block to before it - increase block position
          ref.position += 1;
        } else if (sourceIndex === ref.position) {
          // Moving the block itself
          ref.position = destinationIndex;
        }
      });
    }
    
    // Update the entire sequence
    onPosesChange(newSequence);
  };

  const handleFlowBlockSelect = (flowBlock: FlowBlock) => {
    if (selectedSectionIndex !== null && onFlowBlockAdd) {
      const position = sections[selectedSectionIndex].startIndex;
      onFlowBlockAdd(flowBlock, position);
      setIsFlowBlockModalOpen(false);
      setSelectedSectionIndex(null);
    }
  };

  const handleSaveAsFlowBlock = (section: Section) => {
    setSelectedSectionForSave(section);
    setIsSaveFlowBlockModalOpen(true);
  };

  const handleSaveFlowBlock = (name: string, description?: string) => {
    if (selectedSectionForSave && onSaveAsFlowBlock) {
      onSaveAsFlowBlock(selectedSectionForSave.poses, name, description);
    }
    setSelectedSectionForSave(null);
    setIsSaveFlowBlockModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {title || `${duration}-Minute ${level} Flow`}
          </h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {focus.map((area) => (
              <span key={area} className="tag-primary">
                {area}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {onRegenerateClick && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRegenerateClick}
              className="brutalist-button-secondary flex items-center gap-2"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Regenerate
            </motion.button>
          )}
          {onSaveClick && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSaveClick}
              className="brutalist-button-primary"
            >
              Save Sequence
            </motion.button>
          )}
        </div>
      </div>

      {/* Sections */}
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Droppable droppableId="sequence">
          {(provided) => (
            <div 
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-4"
            >
              {sections.map((section, sectionIndex) => (
                <div
                  key={section.id}
                  className="bg-white/5 rounded-xl"
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <svg
                          className={`w-4 h-4 transform transition-transform ${
                            section.isCollapsed ? '-rotate-90' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      <div>
                        <h3 className="text-lg font-medium text-muted-foreground">
                          {section.name}
                        </h3>
                        <p className="text-sm text-muted-foreground/70">
                          {section.poses.length} poses
                          {flowBlockReferences.some(ref => 
                            ref.position >= section.startIndex && 
                            ref.position < section.startIndex + section.poses.length
                          ) && ' • Contains flow blocks'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {onSaveAsFlowBlock && section.poses.length > 0 && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSaveAsFlowBlock(section)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          title="Save as Flow Block"
                        >
                          <BookmarkIcon className="w-5 h-5" />
                        </motion.button>
                      )}
                      {onFlowBlockAdd && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedSectionIndex(sectionIndex);
                            setIsFlowBlockModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          title="Add Flow Block"
                        >
                          <Squares2X2Icon className="w-5 h-5" />
                        </motion.button>
                      )}
                      {onAddPose && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onAddPose(section.startIndex)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          title="Add Pose"
                        >
                          <PlusIcon className="w-5 h-5" />
                        </motion.button>
                      )}
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {!section.isCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`p-4 space-y-2 transition-colors duration-200 border-t border-white/10`}
                      >
                        {section.poses.map((pose, index) => {
                          const absoluteIndex = section.startIndex + index;
                          const flowBlockRef = flowBlockReferences.find(ref => ref.position === absoluteIndex);

                          return (
                            <Draggable
                              key={`${pose.id}-${absoluteIndex}`}
                              draggableId={`${pose.id}-${absoluteIndex}`}
                              index={absoluteIndex}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white/5 border border-white/10 rounded-xl p-3 cursor-move transition-all duration-200 ease-spring ${
                                    flowBlockRef ? 'border-purple-500/50 bg-purple-500/10' : ''
                                  } ${
                                    snapshot.isDragging 
                                      ? 'shadow-xl ring-2 ring-blue-500/20 scale-105 z-10' 
                                      : 'scale-100 z-0'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                      <h4 className="font-medium text-white truncate">
                                        {pose.english_name}
                                        {flowBlockRef && flowBlockRef.repetitions > 1 && (
                                          <span className="ml-2 text-sm text-purple-300">
                                            x{flowBlockRef.repetitions}
                                          </span>
                                        )}
                                      </h4>
                                      <p className="text-sm text-gray-400 truncate">
                                        {pose.sanskrit_name}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      {onReplacePose && (
                                        <motion.button
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          onClick={() => onReplacePose(absoluteIndex)}
                                          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                        >
                                          <ArrowPathIcon className="w-4 h-4" />
                                        </motion.button>
                                      )}
                                      {onRemovePose && (
                                        <motion.button
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          onClick={() => {
                                            if (flowBlockRef && onFlowBlockRemove) {
                                              onFlowBlockRemove(absoluteIndex);
                                            } else {
                                              onRemovePose(absoluteIndex);
                                            }
                                          }}
                                          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                                        >
                                          <TrashIcon className="w-4 h-4" />
                                        </motion.button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Loading indicator */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center justify-center gap-4 text-muted-foreground"
        >
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Building your sequence...</span>
        </motion.div>
      )}

      {/* Flow Block Modal */}
      <Dialog
        open={isFlowBlockModalOpen}
        onClose={() => {
          setIsFlowBlockModalOpen(false);
          setSelectedSectionIndex(null);
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-4xl w-full bg-background rounded-lg shadow-lg p-6">
            <Dialog.Title className="text-2xl font-bold mb-4">
              Add Flow Block
            </Dialog.Title>

            <FlowBlockManager
              mode="select"
              onSelectFlowBlock={handleFlowBlockSelect}
              className="mt-4"
            />
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Save Flow Block Modal */}
      {selectedSectionForSave && (
        <SaveFlowBlockModal
          isOpen={isSaveFlowBlockModalOpen}
          onClose={() => {
            setIsSaveFlowBlockModalOpen(false);
            setSelectedSectionForSave(null);
          }}
          onSave={handleSaveFlowBlock}
          sectionName={selectedSectionForSave.name}
        />
      )}
    </div>
  );
} 