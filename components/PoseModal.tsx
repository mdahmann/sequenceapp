'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { YogaPose } from '@/lib/data/poses';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface PoseModalProps {
  pose?: YogaPose | null;
  poses?: YogaPose[];
  suggestedPoses?: YogaPose[];
  onClose: () => void;
  onGenerateSequence?: (pose: YogaPose) => void;
  onSelect?: (pose: YogaPose) => void;
}

export default function PoseModal({ 
  pose: singlePose,
  poses = [],
  suggestedPoses = [],
  onClose,
  onGenerateSequence,
  onSelect
}: PoseModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPoses = searchQuery && poses.length > 0
    ? poses.filter(p => 
        p.english_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sanskrit_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : poses;

  // If a single pose is provided and we're not in selection mode (no onSelect), show the detailed view
  if (singlePose && !onSelect) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={e => e.stopPropagation()}
            className="bg-gray-800/90 border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-white">{singlePose.english_name}</h2>
                <p className="text-gray-400">{singlePose.sanskrit_name}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex gap-2">
              <span className="px-3 py-1 text-sm rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {singlePose.difficulty_level}
              </span>
              <span className="px-3 py-1 text-sm rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {singlePose.category_name}
              </span>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Description</h3>
              <p className="text-gray-300 leading-relaxed">{singlePose.pose_description}</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Benefits</h3>
              <p className="text-gray-300 leading-relaxed">{singlePose.pose_benefits}</p>
            </div>

            {onGenerateSequence && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onGenerateSequence(singlePose)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl px-4 py-3 font-medium hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              >
                Generate Sequence with this Pose
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // If we're in selection mode (onSelect is provided), show the selection view
  if (onSelect) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={e => e.stopPropagation()}
            className="bg-gray-800/90 border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Select a Pose</h2>
              <button
                onClick={onClose}
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
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Current pose first */}
              {suggestedPoses[0] && (
                <motion.button
                  key={suggestedPoses[0].id}
                  onClick={() => onSelect(suggestedPoses[0])}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="col-span-1 sm:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-white/20 shadow-xl rounded-xl p-4 text-left hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-800 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium text-white">{suggestedPoses[0].english_name}</h3>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-white border border-white/20">
                      Current Pose
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{suggestedPoses[0].sanskrit_name}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {suggestedPoses[0].difficulty_level}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {suggestedPoses[0].category_name}
                    </span>
                  </div>
                </motion.button>
              )}

              {/* Suggested alternatives next */}
              {suggestedPoses.slice(1).map((pose) => (
                <motion.button
                  key={pose.id}
                  onClick={() => onSelect(pose)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-left hover:bg-purple-500/20 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium text-white">{pose.english_name}</h3>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Suggested
                    </span>
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

              {/* All other poses */}
              {filteredPoses
                .filter(p => !suggestedPoses.some(sp => sp.id === p.id))
                .map((pose) => (
                  <motion.button
                    key={pose.id}
                    onClick={() => onSelect(pose)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 text-left hover:bg-white/10 transition-all"
                  >
                    <h3 className="text-lg font-medium text-white mb-1">{pose.english_name}</h3>
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
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // If we have a single pose but we're in selection mode, show the detailed view
  if (singlePose) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={e => e.stopPropagation()}
            className="bg-gray-800/90 border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-white">{singlePose.english_name}</h2>
                <p className="text-gray-400">{singlePose.sanskrit_name}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex gap-2">
              <span className="px-3 py-1 text-sm rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {singlePose.difficulty_level}
              </span>
              <span className="px-3 py-1 text-sm rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {singlePose.category_name}
              </span>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Description</h3>
              <p className="text-gray-300 leading-relaxed">{singlePose.pose_description}</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Benefits</h3>
              <p className="text-gray-300 leading-relaxed">{singlePose.pose_benefits}</p>
            </div>

            {onGenerateSequence && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onGenerateSequence(singlePose)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl px-4 py-3 font-medium hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              >
                Generate Sequence with this Pose
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
} 