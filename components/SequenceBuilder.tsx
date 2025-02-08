import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ArrowPathIcon, TrashIcon, PlusIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
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
  flowBlockReferences = [],
  onFlowBlockAdd,
  onFlowBlockRemove
}: SequenceBuilderProps) {
  const [isFlowBlockModalOpen, setIsFlowBlockModalOpen] = useState(false);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null);

  // Group poses into sections based on their category and position in sequence
  const sections: Section[] = sequence ? [
    {
      name: 'Warm-up',
      poses: sequence.slice(0, Math.floor(sequence.length * 0.2)),
      startIndex: 0
    },
    {
      name: 'Standing Poses',
      poses: sequence.slice(
        Math.floor(sequence.length * 0.2),
        Math.floor(sequence.length * 0.6)
      ),
      startIndex: Math.floor(sequence.length * 0.2)
    },
    {
      name: 'Peak Work',
      poses: sequence.slice(
        Math.floor(sequence.length * 0.6),
        Math.floor(sequence.length * 0.8)
      ),
      startIndex: Math.floor(sequence.length * 0.6)
    },
    {
      name: 'Cool Down',
      poses: sequence.slice(Math.floor(sequence.length * 0.8)),
      startIndex: Math.floor(sequence.length * 0.8)
    }
  ] : [];

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !sequence || !onPosesChange) return;

    const items = Array.from(sequence);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onPosesChange(items);
  };

  const handleFlowBlockSelect = (flowBlock: FlowBlock) => {
    if (selectedSectionIndex !== null && onFlowBlockAdd) {
      const position = sections[selectedSectionIndex].startIndex;
      onFlowBlockAdd(flowBlock, position);
      setIsFlowBlockModalOpen(false);
      setSelectedSectionIndex(null);
    }
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
      <DragDropContext onDragEnd={handleDragEnd}>
        <AnimatePresence>
          {sections.map((section, sectionIndex) => (
            <motion.div
              key={section.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: sectionIndex * 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-muted-foreground">
                  {section.name}
                </h3>
                <div className="flex items-center gap-2">
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
              <Droppable droppableId={`section-${sectionIndex}`}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-2 transition-colors duration-200 ${
                      snapshot.isDraggingOver ? 'bg-white/5 rounded-xl p-4' : ''
                    }`}
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
                              className={`bg-white/5 border border-white/10 rounded-xl p-4 cursor-move transition-all duration-200 ease-spring ${
                                flowBlockRef ? 'border-purple-500/50 bg-purple-500/10' : ''
                              } ${
                                snapshot.isDragging 
                                  ? 'shadow-xl ring-2 ring-blue-500/20 scale-105 rotate-1 z-10' 
                                  : 'scale-100 rotate-0 z-0'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <h4 className="font-medium text-white">
                                    {pose.english_name}
                                    {flowBlockRef && flowBlockRef.repetitions > 1 && (
                                      <span className="ml-2 text-sm text-purple-300">
                                        x{flowBlockRef.repetitions}
                                      </span>
                                    )}
                                  </h4>
                                  <p className="text-sm text-gray-400">
                                    {pose.sanskrit_name}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {onReplacePose && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => onReplacePose(absoluteIndex)}
                                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                    >
                                      <ArrowPathIcon className="w-5 h-5" />
                                    </motion.button>
                                  )}
                                  {onRemovePose && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale:0.9 }}
                                      onClick={() => {
                                        if (flowBlockRef && onFlowBlockRemove) {
                                          onFlowBlockRemove(absoluteIndex);
                                        } else {
                                          onRemovePose(absoluteIndex);
                                        }
                                      }}
                                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                                    >
                                      <TrashIcon className="w-5 h-5" />
                                    </motion.button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </motion.div>
          ))}
        </AnimatePresence>
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
    </div>
  );
} 