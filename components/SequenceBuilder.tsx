import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ArrowPathIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { YogaPose } from '@/types/YogaPose';

interface SequenceBuilderProps {
  sequence: YogaPose[] | null;
  isLoading: boolean;
  duration: number;
  level: string;
  focus: string[];
  onPosesChange?: (poses: YogaPose[]) => void;
  onReplacePose?: (index: number) => void;
  onRemovePose?: (index: number) => void;
  onSaveClick?: () => void;
  onAddPose?: (index: number) => void;
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
  onPosesChange,
  onReplacePose,
  onRemovePose,
  onSaveClick,
  onAddPose
}: SequenceBuilderProps) {
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

  return (
    <div className="space-y-6">
      {/* Header with Title and Save Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {duration}-Minute {level} Flow
          </h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {focus.map((area) => (
              <span key={area} className="tag-primary">
                {area}
              </span>
            ))}
          </div>
        </div>
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
                {onAddPose && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onAddPose(section.startIndex)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    <PlusIcon className="w-5 h-5" />
                  </motion.button>
                )}
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
                    {section.poses.map((pose, index) => (
                      <Draggable
                        key={`${pose.id}-${section.startIndex + index}`}
                        draggableId={`${pose.id}-${section.startIndex + index}`}
                        index={section.startIndex + index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white/5 border border-white/10 rounded-xl p-4 cursor-move transition-all duration-200 ease-spring ${
                              snapshot.isDragging 
                                ? 'shadow-xl ring-2 ring-blue-500/20 scale-105 rotate-1 z-10' 
                                : 'scale-100 rotate-0 z-0'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <h4 className="font-medium text-white">
                                  {pose.english_name}
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
                                    onClick={() => onReplacePose(section.startIndex + index)}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                  >
                                    <ArrowPathIcon className="w-5 h-5" />
                                  </motion.button>
                                )}
                                {onRemovePose && (
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale:0.9 }}
                                    onClick={() => onRemovePose(section.startIndex + index)}
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
                    ))}
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
    </div>
  );
} 