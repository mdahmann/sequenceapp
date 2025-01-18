'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { YogaPose } from '@/lib/data/poses';
import PoseModal from './PoseModal';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import CustomPoseForm from './CustomPoseForm';

interface PoseNavigatorProps {
  poses: YogaPose[];
  categories: string[];
}

export default function PoseNavigator({ poses: initialPoses, categories }: PoseNavigatorProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedPose, setSelectedPose] = useState<YogaPose | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isCustomPoseFormOpen, setIsCustomPoseFormOpen] = useState(false);
  const [customPoses, setCustomPoses] = useState<YogaPose[]>([]);
  const [isLoadingCustomPoses, setIsLoadingCustomPoses] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);

      // Subscribe to auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session);
      });

      return () => subscription.unsubscribe();
    };

    checkAuth();
  }, []);

  const fetchCustomPoses = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        setCustomPoses([]);
        return;
      }

      const { data, error } = await supabase
        .from('custom_poses')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setCustomPoses(data || []);
    } catch (error) {
      console.error('Error fetching custom poses:', error);
      setCustomPoses([]);
    } finally {
      setIsLoadingCustomPoses(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCustomPoses();
    } else {
      setCustomPoses([]);
      setIsLoadingCustomPoses(false);
    }
  }, [isAuthenticated]);

  const allPoses = useMemo(() => {
    return [...initialPoses, ...customPoses];
  }, [initialPoses, customPoses]);

  const filteredPoses = useMemo(() => {
    return allPoses.filter(pose => {
      const matchesSearch = searchQuery
        ? pose.english_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pose.sanskrit_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pose.pose_description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesCategory = selectedCategory
        ? pose.category_name === selectedCategory
        : true;

      const matchesLevel = selectedLevel
        ? pose.difficulty_level === selectedLevel
        : true;

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [allPoses, searchQuery, selectedCategory, selectedLevel]);

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

  const handleSaveCustomPose = async (pose: Omit<YogaPose, 'id'>) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('custom_poses')
        .insert({
          ...pose,
          user_id: session.session.user.id
        });

      if (error) {
        throw error;
      }

      // Refresh the custom poses list
      await fetchCustomPoses();
    } catch (error) {
      console.error('Error saving custom pose:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleDeleteCustomPose = async (id: number) => {
    if (!confirm('Are you sure you want to delete this custom pose?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('custom_poses')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Refresh the custom poses list
      await fetchCustomPoses();
    } catch (error) {
      console.error('Error deleting custom pose:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="space-y-6">
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
        className="flex flex-col sm:flex-row gap-4"
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search poses..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />

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

        {isAuthenticated && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCustomPoseFormOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl px-6 py-3 font-medium hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all whitespace-nowrap"
          >
            Add Custom Pose
          </motion.button>
        )}
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
        {filteredPoses.map((pose) => {
          const isCustomPose = customPoses.some(cp => cp.id === pose.id);
          return (
            <motion.div
              key={pose.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer group ${
                isCustomPose ? 'border-purple-500/30 bg-purple-500/5' : ''
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1" onClick={() => setSelectedPose(pose)}>
                    <h3 className="text-xl font-medium mb-1 text-white">{pose.english_name}</h3>
                    <p className="text-sm text-gray-400">{pose.sanskrit_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAuthenticated && isCustomPose && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomPose(pose.id);
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400 hover:text-red-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                    {isCustomPose && (
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Custom
                      </span>
                    )}
                  </div>
                </div>
                <div onClick={() => setSelectedPose(pose)}>
                  <p className="text-sm text-gray-300 line-clamp-2">
                    {pose.pose_description}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <span className="px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {pose.difficulty_level}
                    </span>
                    <span className="px-3 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {pose.category_name}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Loading State */}
      {isLoadingCustomPoses && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/20"></div>
        </div>
      )}

      {/* Modals */}
      {selectedPose && (
        <PoseModal 
          pose={selectedPose} 
          onClose={() => setSelectedPose(null)}
          onGenerateSequence={generateSequenceFromPose}
        />
      )}

      <AnimatePresence>
        {isCustomPoseFormOpen && (
          <CustomPoseForm
            onSubmit={handleSaveCustomPose}
            onClose={() => setIsCustomPoseFormOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
} 