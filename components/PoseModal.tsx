'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { YogaPose } from '@/types/YogaPose';
import { 
  XMarkIcon, 
  ArrowPathIcon, 
  BeakerIcon, 
  HeartIcon, 
  SparklesIcon,
  BookOpenIcon,
  AcademicCapIcon,
  FireIcon
} from '@heroicons/react/24/outline';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');

  const filteredPoses = searchQuery || selectedCategory || selectedLevel
    ? poses.filter(p => {
        const matchesSearch = !searchQuery || 
          p.english_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sanskrit_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || p.category_name === selectedCategory;
        const matchesLevel = !selectedLevel || p.difficulty_level === selectedLevel;
        return matchesSearch && matchesCategory && matchesLevel;
      })
    : poses;

  const categories = Array.from(new Set(poses.map(p => p.category_name)));
  const levels = ['Beginner', 'Intermediate', 'Expert'];

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
      <div className="fixed inset-0 bg-black/30 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-3xl bg-white dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden"
        >
          {/* Header with gradient background */}
          <div className="relative bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 p-6">
            <div className="absolute inset-0 bg-white/10 dark:bg-black/20" />
            <div className="relative">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h2 className="text-4xl font-bold text-gray-900 dark:text-white">{poseToShow.english_name}</h2>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl text-gray-600 dark:text-gray-300">{poseToShow.sanskrit_name}</h3>
                    {poseToShow.sanskrit_name_adapted && (
                      <span className="text-gray-500 dark:text-gray-400">({poseToShow.sanskrit_name_adapted})</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex gap-2 mt-4">
                <span className="px-4 py-1.5 text-sm font-bold rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-500/30">
                  {poseToShow.difficulty_level}
                </span>
                <span className="px-4 py-1.5 text-sm font-bold rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 border-2 border-purple-200 dark:border-purple-500/30">
                  {poseToShow.category_name}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {poseToShow.translation_name && (
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <SparklesIcon className="w-5 h-5 text-pink-500 dark:text-pink-400" />
                <p className="text-lg">
                  <span className="text-pink-500 dark:text-pink-400 font-bold">Translation:</span> {poseToShow.translation_name}
                </p>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-gray-50 dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 rounded-xl p-5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors group">
                <div className="flex items-center gap-3 mb-3">
                  <BeakerIcon className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                  <h4 className="text-lg font-bold text-blue-500 dark:text-blue-400 tracking-wide">Description</h4>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{poseToShow.pose_description}</p>
              </div>

              {poseToShow.pose_benefits && (
                <div className="bg-gray-50 dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 rounded-xl p-5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors group">
                  <div className="flex items-center gap-3 mb-3">
                    <HeartIcon className="w-6 h-6 text-pink-500 dark:text-pink-400" />
                    <h4 className="text-lg font-bold text-pink-500 dark:text-pink-400 tracking-wide">Benefits</h4>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{poseToShow.pose_benefits}</p>
                </div>
              )}
            </div>

            {onGenerateSequence && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleGenerateSequence(poseToShow)}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all border-2 border-transparent hover:border-white/10 flex items-center justify-center gap-3 group"
              >
                <FireIcon className="w-6 h-6 group-hover:animate-pulse" />
                Generate Sequence with this Pose
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // Pose selection/replacement modal
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-white/10 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="relative bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 p-6">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative flex justify-between items-center">
            <h2 className="text-3xl font-bold text-white">
              {mode === 'replace' ? 'Replace Pose' : 'Select Pose'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <input
            type="text"
            placeholder="SEARCH POSES..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 rounded-xl px-4 py-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />

          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 bg-gray-50 dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 rounded-xl px-4 py-4 text-gray-900 dark:text-white appearance-none cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">ALL CATEGORIES</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="flex-1 bg-gray-50 dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 rounded-xl px-4 py-4 text-gray-900 dark:text-white appearance-none cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">ALL LEVELS</option>
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-0">
          <div className="space-y-6">
            {mode === 'replace' && suggestedPoses.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Suggested Replacements</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {isLoadingSuggestions ? (
                    Array(2).fill(0).map((_, i) => (
                      <div
                        key={`loading-${i}`}
                        className="bg-white/5 border-2 border-white/10 rounded-xl p-4 animate-pulse"
                      >
                        <div className="h-6 w-32 bg-white/10 rounded mb-2"></div>
                        <div className="h-4 w-24 bg-white/10 rounded"></div>
                      </div>
                    ))
                  ) : (
                    suggestedPoses.slice(0, 2).map((pose) => (
                      <motion.button
                        key={pose.id}
                        onClick={() => handleSelect(pose)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-white/5 border-2 border-white/10 rounded-xl p-4 text-left hover:bg-white/10 transition-colors group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white">{pose.english_name}</h4>
                            <span className="px-2 py-0.5 text-xs font-bold tracking-wide bg-blue-500/20 text-blue-300 border-2 border-blue-500/30 rounded-full">
                              Suggested
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">{pose.sanskrit_name}</p>
                          <div className="flex gap-2">
                            <span className="px-2 py-1 text-xs font-bold tracking-wide bg-purple-500/20 text-purple-300 border-2 border-purple-500/30 rounded-full">
                              {pose.difficulty_level}
                            </span>
                            <span className="px-2 py-1 text-xs font-bold tracking-wide bg-blue-500/20 text-blue-300 border-2 border-blue-500/30 rounded-full">
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

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">All Poses</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPoses.map((pose) => (
                  <motion.button
                    key={pose.id}
                    onClick={() => handleSelect(pose)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gray-50 dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 rounded-xl p-4 text-left hover:bg-gray-100 dark:hover:bg-white/10 transition-colors group"
                  >
                    <div className="space-y-3">
                      <h4 className="font-bold text-gray-900 dark:text-white">{pose.english_name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{pose.sanskrit_name}</p>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 text-xs font-bold tracking-wide bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-500/30 rounded-full">
                          {pose.difficulty_level}
                        </span>
                        <span className="px-2 py-1 text-xs font-bold tracking-wide bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 border-2 border-purple-200 dark:border-purple-500/30 rounded-full">
                          {pose.category_name}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 