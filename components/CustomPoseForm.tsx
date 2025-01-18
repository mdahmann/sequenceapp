'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { YogaPose } from '@/types/YogaPose';

interface CustomPoseFormProps {
  pose?: YogaPose | null;
  onSubmit: (pose: Omit<YogaPose, 'id'>) => void;
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

export default function CustomPoseForm({ pose, onSubmit, onClose }: CustomPoseFormProps) {
  const [formData, setFormData] = useState<Omit<YogaPose, 'id'>>({
    english_name: '',
    sanskrit_name: '',
    sanskrit_name_adapted: '',
    translation_name: '',
    pose_description: '',
    pose_benefits: '',
    difficulty_level: 'Beginner',
    category_name: CATEGORIES[0]
  });

  useEffect(() => {
    if (pose) {
      const { id, ...poseData } = pose;
      setFormData(poseData);
    }
  }, [pose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-gray-900 rounded-xl p-6 max-w-4xl w-full mx-4 my-8 border border-white/10 shadow-xl"
      >
        <h2 className="text-2xl font-semibold mb-6">
          {pose ? 'Edit Custom Pose' : 'Add Custom Pose'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                English Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.english_name}
                onChange={(e) => setFormData({ ...formData, english_name: e.target.value })}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Sanskrit Name</label>
              <input
                type="text"
                value={formData.sanskrit_name}
                onChange={(e) => setFormData({ ...formData, sanskrit_name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Sanskrit Name (Adapted)</label>
              <input
                type="text"
                value={formData.sanskrit_name_adapted}
                onChange={(e) => setFormData({ ...formData, sanskrit_name_adapted: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Translation Name</label>
              <input
                type="text"
                value={formData.translation_name}
                onChange={(e) => setFormData({ ...formData, translation_name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.pose_description}
              onChange={(e) => setFormData({ ...formData, pose_description: e.target.value })}
              required
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Benefits</label>
            <textarea
              value={formData.pose_benefits}
              onChange={(e) => setFormData({ ...formData, pose_benefits: e.target.value })}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty Level</label>
              <select
                value={formData.difficulty_level}
                onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value as YogaPose['difficulty_level'] })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {DIFFICULTY_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={formData.category_name}
                onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors"
            >
              {pose ? 'Save Changes' : 'Add Pose'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
} 