'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { YogaPose } from '@/lib/data/poses';

interface CustomPoseFormProps {
  onSubmit: (pose: Omit<YogaPose, 'id'>) => Promise<void>;
  onClose: () => void;
}

const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Expert'] as const;
const CATEGORIES = [
  'Standing',
  'Seated',
  'Supine',
  'Prone',
  'Core',
  'Backbend',
  'Forward Bend',
  'Hip Opener',
  'Inversion',
  'Balance',
  'Arm Balance'
] as const;

export default function CustomPoseForm({ onSubmit, onClose }: CustomPoseFormProps) {
  const [formData, setFormData] = useState<Omit<YogaPose, 'id'>>({
    english_name: '',
    sanskrit_name: '',
    sanskrit_name_adapted: '',
    translation_name: '',
    pose_description: '',
    pose_benefits: '',
    difficulty_level: 'Beginner',
    category_name: 'Standing'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting custom pose:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
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
        className="bg-gray-800/90 border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Add Custom Pose</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="english_name" className="block text-sm font-medium text-gray-300 mb-1">
                English Name *
              </label>
              <input
                type="text"
                id="english_name"
                name="english_name"
                required
                value={formData.english_name}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label htmlFor="sanskrit_name" className="block text-sm font-medium text-gray-300 mb-1">
                Sanskrit Name
              </label>
              <input
                type="text"
                id="sanskrit_name"
                name="sanskrit_name"
                value={formData.sanskrit_name}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label htmlFor="sanskrit_name_adapted" className="block text-sm font-medium text-gray-300 mb-1">
                Adapted Sanskrit Name
              </label>
              <input
                type="text"
                id="sanskrit_name_adapted"
                name="sanskrit_name_adapted"
                value={formData.sanskrit_name_adapted}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label htmlFor="translation_name" className="block text-sm font-medium text-gray-300 mb-1">
                Translation
              </label>
              <input
                type="text"
                id="translation_name"
                name="translation_name"
                value={formData.translation_name}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label htmlFor="pose_description" className="block text-sm font-medium text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                id="pose_description"
                name="pose_description"
                required
                value={formData.pose_description}
                onChange={handleChange}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label htmlFor="pose_benefits" className="block text-sm font-medium text-gray-300 mb-1">
                Benefits *
              </label>
              <textarea
                id="pose_benefits"
                name="pose_benefits"
                required
                value={formData.pose_benefits}
                onChange={handleChange}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="difficulty_level" className="block text-sm font-medium text-gray-300 mb-1">
                  Difficulty Level *
                </label>
                <select
                  id="difficulty_level"
                  name="difficulty_level"
                  required
                  value={formData.difficulty_level}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none cursor-pointer hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {DIFFICULTY_LEVELS.map(level => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="category_name" className="block text-sm font-medium text-gray-300 mb-1">
                  Category *
                </label>
                <select
                  id="category_name"
                  name="category_name"
                  required
                  value={formData.category_name}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none cursor-pointer hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl px-4 py-3 font-medium hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Pose'}
            </motion.button>
            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-white/5 text-white rounded-xl px-4 py-3 font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
} 