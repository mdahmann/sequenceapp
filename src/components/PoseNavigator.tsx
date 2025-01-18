'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { YogaPose } from '@/lib/data/poses';
import PoseModal from './PoseModal';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface PoseNavigatorProps {
  poses: YogaPose[];
  categories: string[];
}

export default function PoseNavigator({ poses, categories }: PoseNavigatorProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedPose, setSelectedPose] = useState<YogaPose | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const filteredPoses = useMemo(() => {
    return poses.filter(pose => {
      const matchesSearch = searchQuery === '' || 
        pose.english_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pose.sanskrit_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pose.pose_description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === '' || 
        pose.category_name === selectedCategory;

      const matchesLevel = selectedLevel === '' || 
        pose.difficulty_level === selectedLevel;

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [poses, searchQuery, selectedCategory, selectedLevel]);

  const handleSearch = async () => {
    setIsSearching(true);
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSearching(false);
  };

  const generateSequenceFromPose = (pose: YogaPose) => {
    // Check if user is logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      // Navigate to generate page with pose as focus
      router.push(`/generate?pose=${pose.id}`);
    };
    checkAuth();
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Explore Yoga Poses
        </h1>
        <p className="text-xl text-gray-400">
          Discover and learn about different yoga poses
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="relative md:col-span-2">
          <input
            type="text"
            placeholder="Search poses by name, sanskrit name, or description..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none cursor-pointer hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none cursor-pointer hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Expert">Expert</option>
        </select>
      </motion.div>

      {/* Results Count */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-400"
      >
        {filteredPoses.length} poses found
      </motion.div>

      {/* Results Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredPoses.map((pose) => (
          <motion.div
            key={pose.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer group"
            onClick={() => setSelectedPose(pose)}
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-1 text-white">{pose.english_name}</h3>
                <p className="text-sm text-gray-400">{pose.sanskrit_name}</p>
              </div>
              <p className="text-sm text-gray-300 line-clamp-2">
                {pose.pose_description}
              </p>
              <div className="flex gap-2">
                <span className="px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {pose.difficulty_level}
                </span>
                <span className="px-3 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {pose.category_name}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Modal */}
      <PoseModal 
        pose={selectedPose} 
        onClose={() => setSelectedPose(null)}
        onGenerateSequence={generateSequenceFromPose}
      />
    </div>
  );
} 