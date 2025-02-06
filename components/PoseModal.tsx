'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { YogaPose } from '@/types/YogaPose';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface PoseModalProps {
  pose?: YogaPose | null;
  poses?: YogaPose[];
  suggestedPoses?: YogaPose[];
  isLoadingSuggestions?: boolean;
  onClose: () => void;
  onGenerateSequence?: (pose: YogaPose) => void;
  onSelect?: (pose: YogaPose) => void;
  mode?: 'view' | 'select' | 'replace';
}

export default function PoseModal({ 
  pose: singlePose,
  poses = [],
  suggestedPoses = [],
  isLoadingSuggestions = false,
  onClose,
  onGenerateSequence,
  onSelect,
  mode = 'select'
}: PoseModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPose, setExpandedPose] = useState<string | null>(null);
  const [selectedPose, setSelectedPose] = useState<YogaPose | null>(null);

  const filteredPoses = searchQuery && poses.length > 0
    ? poses.filter(p => 
        p.english_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sanskrit_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : poses;

  const handleClose = () => {
    if (selectedPose) {
      setSelectedPose(null);
    } else if (onClose) {
      onClose();
    }
  };

  const handleSelect = (pose: YogaPose) => {
    if (mode === 'select' || mode === 'replace') {
      if (onSelect) {
        onSelect(pose);
      }
    } else {
      setSelectedPose(pose);
    }
  };

  const handleGenerateSequence = (pose: YogaPose) => {
    if (onGenerateSequence) {
      onGenerateSequence(pose);
    }
  };

  // If we're showing a single pose details
  if ((mode === 'view' && singlePose) || selectedPose) {
    const poseToShow = selectedPose || singlePose;
    if (!poseToShow) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="brutalist-card w-full max-w-2xl mx-4"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{poseToShow.english_name}</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-secondary/80 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">{poseToShow.sanskrit_name}</h3>
              {poseToShow.sanskrit_name_adapted && (
                <span className="text-muted-foreground">({poseToShow.sanskrit_name_adapted})</span>
              )}
            </div>

            {poseToShow.translation_name && (
              <p className="text-muted-foreground italic">
                Translation: {poseToShow.translation_name}
              </p>
            )}

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Description</h4>
                <p className="text-foreground">{poseToShow.pose_description}</p>
              </div>

              {poseToShow.pose_benefits && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Benefits</h4>
                  <p className="text-foreground">{poseToShow.pose_benefits}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <span className="tag-primary">
                {poseToShow.difficulty_level}
              </span>
              <span className="tag-accent">
                {poseToShow.category_name}
              </span>
            </div>

            {onGenerateSequence && (
              <button
                onClick={() => handleGenerateSequence(poseToShow)}
                className="brutalist-button-primary w-full"
              >
                Generate Sequence with this Pose
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // Pose selection/replacement modal
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative brutalist-card w-full max-w-4xl mx-4 my-8"
      >
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold tracking-tighter">
              {mode === 'replace' ? 'REPLACE POSE' : mode === 'view' ? singlePose?.english_name.toUpperCase() : 'SELECT POSE'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-secondary/80 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {mode !== 'view' && (
            <input
              type="text"
              placeholder="Search poses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="brutalist-input text-lg"
            />
          )}

          <div className="space-y-8">
            {mode === 'view' && singlePose ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-medium">{singlePose.sanskrit_name}</h3>
                    {singlePose.sanskrit_name_adapted && (
                      <span className="text-muted-foreground">({singlePose.sanskrit_name_adapted})</span>
                    )}
                  </div>

                  {singlePose.translation_name && (
                    <p className="text-muted-foreground italic">
                      Translation: {singlePose.translation_name}
                    </p>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Description</h4>
                      <p className="text-foreground">{singlePose.pose_description}</p>
                    </div>

                    {singlePose.pose_benefits && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Benefits</h4>
                        <p className="text-foreground">{singlePose.pose_benefits}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <span className="tag-primary">
                      {singlePose.difficulty_level}
                    </span>
                    <span className="tag-accent">
                      {singlePose.category_name}
                    </span>
                  </div>
                </div>

                {onGenerateSequence && (
                  <button
                    onClick={() => handleGenerateSequence(singlePose)}
                    className="brutalist-button-primary w-full"
                  >
                    Generate Sequence with this Pose
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Suggested Poses Section */}
                {mode === 'replace' && suggestedPoses.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold tracking-tighter">SUGGESTED REPLACEMENTS</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {isLoadingSuggestions ? (
                        Array(2).fill(0).map((_, i) => (
                          <div
                            key={`loading-${i}`}
                            className="brutalist-card animate-pulse"
                          >
                            <div className="h-6 w-32 bg-muted rounded mb-2"></div>
                            <div className="h-4 w-24 bg-muted rounded"></div>
                          </div>
                        ))
                      ) : (
                        suggestedPoses.slice(0, 2).map((pose) => (
                          <motion.button
                            key={pose.id}
                            onClick={() => handleSelect(pose)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="brutalist-card text-left"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium truncate">{pose.english_name}</h4>
                                <span className="px-2 py-0.5 text-xs font-medium tracking-wide uppercase bg-primary/20 text-primary-foreground border border-primary/30">
                                  Suggested
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{pose.sanskrit_name}</p>
                              <div className="flex gap-2">
                                <span className="px-2 py-1 text-xs font-medium tracking-wide uppercase bg-accent/20 text-accent-foreground border border-accent/30">
                                  {pose.difficulty_level}
                                </span>
                                <span className="px-2 py-1 text-xs font-medium tracking-wide uppercase bg-secondary text-secondary-foreground border border-border">
                                  {pose.category_name}
                                </span>
                              </div>
                            </div>
                          </motion.button>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* All Poses Section */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold tracking-tighter">ALL POSES</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[calc(100vh-24rem)] overflow-y-auto p-1">
                    {filteredPoses
                      .filter(p => !suggestedPoses.some(sp => sp.id === p.id))
                      .map((pose) => (
                      <motion.div
                        key={pose.id}
                        className="relative"
                      >
                        <motion.button
                          onClick={() => handleSelect(pose)}
                          onMouseEnter={() => setExpandedPose(pose.id.toString())}
                          onMouseLeave={() => setExpandedPose(null)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="brutalist-card w-full text-left"
                        >
                          <h4 className="font-medium truncate">{pose.english_name}</h4>
                          <p className="text-sm text-muted-foreground truncate">{pose.sanskrit_name}</p>
                          <div className="flex gap-2 mt-2">
                            <span className="tag-primary">
                              {pose.difficulty_level}
                            </span>
                            <span className="tag-accent">
                              {pose.category_name}
                            </span>
                          </div>
                        </motion.button>

                        <AnimatePresence>
                          {expandedPose === pose.id.toString() && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="absolute left-0 right-0 top-full mt-2 z-10 brutalist-card"
                            >
                              <div className="space-y-4">
                                {pose.translation_name && (
                                  <p className="text-sm text-muted-foreground italic">
                                    Translation: {pose.translation_name}
                                  </p>
                                )}
                                
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Description</h4>
                                  <p className="text-sm text-foreground">{pose.pose_description}</p>
                                </div>

                                {pose.pose_benefits && (
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Benefits</h4>
                                    <p className="text-sm text-foreground">{pose.pose_benefits}</p>
                                  </div>
                                )}

                                {onGenerateSequence && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleGenerateSequence(pose);
                                    }}
                                    className="brutalist-button-primary w-full mt-4"
                                  >
                                    Generate Sequence with this Pose
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
} 