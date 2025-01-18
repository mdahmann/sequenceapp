'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { YogaPose } from '@/lib/data/poses';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface PoseModalProps {
  pose?: YogaPose | null;
  poses?: YogaPose[];
  suggestedPoses?: YogaPose[];
  isLoadingSuggestions?: boolean;
  onClose: () => void;
  onGenerateSequence?: (pose: YogaPose) => void;
  onSelect?: (pose: YogaPose) => void;
}

export default function PoseModal({ 
  pose: singlePose,
  poses = [],
  suggestedPoses = [],
  isLoadingSuggestions = false,
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

  const isCustomPose = (pose: YogaPose) => {
    return 'user_id' in pose;
  };

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

  // If we're showing a single pose (not replacing)
  if (singlePose && !poses.length) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl">
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
              {isCustomPose(singlePose) && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                  Custom Pose
                </span>
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
        </div>
      </div>
    );
  }

  // Original pose replacement modal code
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Replace Pose</h2>
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

        <div className="max-h-[calc(100vh-16rem)] overflow-y-auto">
          <div className="space-y-6">
            {/* Current pose first */}
            {suggestedPoses[0] && (
              <motion.button
                key={suggestedPoses[0].id}
                onClick={() => handleSelect(suggestedPoses[0])}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-white/20 shadow-xl rounded-xl p-4 text-left hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-800 transition-all"
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
            {isLoadingSuggestions ? (
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
                {suggestedPoses.slice(1, 3).map((pose) => (
                  <motion.button
                    key={pose.id}
                    onClick={() => handleSelect(pose)}
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
              {filteredPoses
                .filter(p => !suggestedPoses.some(sp => sp.id === p.id))
                .map((pose) => (
                  <motion.button
                    key={pose.id}
                    onClick={() => handleSelect(pose)}
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
  );
} 