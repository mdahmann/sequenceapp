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

  const filteredPoses = searchQuery && poses.length > 0
    ? poses.filter(p => 
        p.english_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sanskrit_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : poses;

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleSelect = (pose: YogaPose) => {
    if (onSelect) {
      onSelect(pose);
    }
  };

  const handleGenerateSequence = (pose: YogaPose) => {
    if (onGenerateSequence) {
      onGenerateSequence(pose);
    }
  };

  // If we're showing a single pose details
  if (mode === 'view' && singlePose) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl mx-4"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">{singlePose.english_name}</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-white">{singlePose.sanskrit_name}</h3>
              {singlePose.sanskrit_name_adapted && (
                <span className="text-gray-400">({singlePose.sanskrit_name_adapted})</span>
              )}
            </div>

            {singlePose.translation_name && (
              <p className="text-gray-400 italic">
                Translation: {singlePose.translation_name}
              </p>
            )}

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Description</h4>
                <p className="text-white">{singlePose.pose_description}</p>
              </div>

              {singlePose.pose_benefits && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Benefits</h4>
                  <p className="text-white">{singlePose.pose_benefits}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <span className="px-3 py-1.5 text-sm rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {singlePose.difficulty_level}
              </span>
              <span className="px-3 py-1.5 text-sm rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {singlePose.category_name}
              </span>
            </div>

            {onGenerateSequence && (
              <button
                onClick={() => handleGenerateSequence(singlePose)}
                className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl px-4 py-3 font-medium hover:from-blue-600 hover:to-purple-600 transition-colors"
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-800 rounded-2xl p-6 w-full max-w-4xl mx-4 my-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {mode === 'replace' ? 'Replace Pose' : 'Select Pose'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <input
          type="text"
          placeholder="Search poses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-6"
        />

        <div className="space-y-6">
          {/* Suggested Poses Section */}
          {mode === 'replace' && suggestedPoses.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Suggested Replacements</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {isLoadingSuggestions ? (
                  // Loading skeletons
                  Array(2).fill(0).map((_, i) => (
                    <div
                      key={`loading-${i}`}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse"
                    >
                      <div className="h-6 w-32 bg-white/10 rounded mb-2"></div>
                      <div className="h-4 w-24 bg-white/10 rounded"></div>
                    </div>
                  ))
                ) : (
                  // Only show first 2 suggested poses
                  suggestedPoses.slice(0, 2).map((pose) => (
                    <motion.button
                      key={pose.id}
                      onClick={() => handleSelect(pose)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full text-left p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 hover:from-purple-500/30 hover:to-blue-500/30 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-white truncate">{pose.english_name}</h4>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30">
                          Suggested
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 truncate">{pose.sanskrit_name}</p>
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
            </div>
          )}

          {/* All Poses Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">All Poses</h3>
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
                    className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                  >
                    <h4 className="font-medium text-white truncate">{pose.english_name}</h4>
                    <p className="text-sm text-gray-400 truncate">{pose.sanskrit_name}</p>
                    
                    <AnimatePresence>
                      {expandedPose === pose.id.toString() && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="absolute left-0 right-0 top-full mt-2 z-10 bg-gray-800 rounded-xl p-4 border border-white/10 shadow-xl"
                        >
                          <p className="text-sm text-white mb-2">{pose.pose_description}</p>
                          <div className="flex gap-2">
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              {pose.difficulty_level}
                            </span>
                            <span className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {pose.category_name}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 