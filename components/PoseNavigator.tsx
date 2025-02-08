'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { YogaPose } from '@/types/YogaPose';
import PoseModal from './PoseModal';
import { useRouter } from 'next/navigation';
import CustomPoseForm from './CustomPoseForm';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ConfirmationModal from './ConfirmationModal';
import { MagnifyingGlassIcon, PlusIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

interface PoseNavigatorProps {
  poses: YogaPose[];
  categories?: string[];
}

export default function PoseNavigator({ poses: initialPoses, categories }: PoseNavigatorProps) {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [selectedPose, setSelectedPose] = useState<YogaPose | null>(null);
  const [isCustomPoseFormOpen, setIsCustomPoseFormOpen] = useState(false);
  const [customPoses, setCustomPoses] = useState<YogaPose[]>([]);
  const [isLoadingCustomPoses, setIsLoadingCustomPoses] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [poseToDelete, setPoseToDelete] = useState<YogaPose | null>(null);
  const [poseToEdit, setPoseToEdit] = useState<YogaPose | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  const allPoses = useMemo(() => {
    return [
      ...initialPoses,
      ...customPoses.map(pose => ({
        ...pose,
        id: `custom-${pose.id}`
      }))
    ];
  }, [initialPoses, customPoses]);

  const handleDeleteCustomPose = async (pose: YogaPose) => {
    setPoseToDelete(pose);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!poseToDelete) return;

    try {
      const numericId = typeof poseToDelete.id === 'string' 
        ? Number(poseToDelete.id.toString().replace('custom-', '')) 
        : poseToDelete.id;
      
      const { error } = await supabase
        .from('custom_poses')
        .delete()
        .eq('id', numericId);

      if (error) {
        console.error('Error deleting custom pose:', error);
        return;
      }

      // Remove from local state
      const updatedCustomPoses = customPoses.filter(p => p.id !== poseToDelete.id);
      setCustomPoses(updatedCustomPoses);
      setPoseToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting custom pose:', error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Auth state:', !!session);
      setIsAuthenticated(!!session);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        console.log('Auth state changed:', !!session);
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
    }
  };

  const handleEditCustomPose = (pose: YogaPose) => {
    setPoseToEdit(pose);
    setIsCustomPoseFormOpen(true);
  };

  const filteredPoses = useMemo(() => {
    return allPoses.filter(pose => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || 
        pose.english_name.toLowerCase().includes(searchLower) ||
        (pose.sanskrit_name && pose.sanskrit_name.toLowerCase().includes(searchLower)) ||
        (pose.pose_description && pose.pose_description.toLowerCase().includes(searchLower));
      
      const matchesCategory = selectedCategory === '' || pose.category_name === selectedCategory;
      const matchesLevel = selectedLevel === '' || pose.difficulty_level === selectedLevel;
      
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [allPoses, searchQuery, selectedCategory, selectedLevel]);

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
        className="text-center space-y-4 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl -z-10" />
        <h1 className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 font-mono">
          POSE LIBRARY
        </h1>
        <p className="text-xl text-gray-400 font-mono uppercase tracking-wide">
          Discover & Learn Yoga Poses
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH POSES..."
            className="w-full bg-white/5 border-2 border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <AdjustmentsHorizontalIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white/5 border-2 border-white/10 rounded-xl pl-12 pr-4 py-4 text-white appearance-none cursor-pointer hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono"
            >
              <option value="">ALL CATEGORIES</option>
              {categories?.map((category) => (
                <option key={category} value={category}>
                  {category.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1">
            <AdjustmentsHorizontalIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full bg-white/5 border-2 border-white/10 rounded-xl pl-12 pr-4 py-4 text-white appearance-none cursor-pointer hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono"
            >
              <option value="">ALL LEVELS</option>
              <option value="Beginner">BEGINNER</option>
              <option value="Intermediate">INTERMEDIATE</option>
              <option value="Expert">EXPERT</option>
            </select>
          </div>

          {isAuthenticated && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCustomPoseFormOpen(true)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl px-8 py-4 font-mono hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all border-2 border-transparent hover:border-white/10"
            >
              <PlusIcon className="w-5 h-5" />
              <span>ADD POSE</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Results Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredPoses.map((pose) => {
          const isCustomPose = pose.user_id !== undefined;
          return (
            <motion.div
              key={pose.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative bg-white/5 border-2 ${
                isCustomPose ? 'border-purple-500/30' : 'border-white/10'
              } rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer group overflow-hidden`}
              onClick={() => setSelectedPose(pose)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20 pointer-events-none" />
              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-1">
                    <h3 className="text-xl font-bold text-white font-mono">{pose.english_name}</h3>
                    <p className="text-sm text-gray-400 font-mono">{pose.sanskrit_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAuthenticated && isCustomPose && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCustomPose(pose);
                          }}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-blue-400 hover:text-blue-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomPose(pose);
                          }}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400 hover:text-red-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-300 line-clamp-2 font-mono">
                  {pose.pose_description}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-500/20 text-blue-300 border-2 border-blue-500/30 font-mono uppercase">
                    {pose.difficulty_level}
                  </span>
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-500/20 text-purple-300 border-2 border-purple-500/30 font-mono uppercase">
                    {pose.category_name}
                  </span>
                  {isCustomPose && (
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-500/20 text-green-300 border-2 border-green-500/30 font-mono uppercase">
                      Custom
                    </span>
                  )}
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
          mode="view"
        />
      )}

      <AnimatePresence>
        {isCustomPoseFormOpen && (
          <CustomPoseForm
            pose={poseToEdit}
            onSubmit={async (pose) => {
              if (poseToEdit) {
                const { error } = await supabase
                  .from('custom_poses')
                  .update(pose)
                  .eq('id', poseToEdit.id);

                if (error) {
                  console.error('Error updating custom pose:', error);
                  return;
                }
              } else {
                await handleSaveCustomPose(pose);
              }
              setPoseToEdit(null);
              setIsCustomPoseFormOpen(false);
            }}
            onClose={() => {
              setPoseToEdit(null);
              setIsCustomPoseFormOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setPoseToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Custom Pose"
        message="Are you sure you want to delete this custom pose? This action cannot be undone."
      />
    </div>
  );
} 