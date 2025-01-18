'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  experience_level: 'Beginner' | 'Intermediate' | 'Expert';
  preferred_style: string;
  practice_frequency: string;
  focus_areas: string[];
  notifications_enabled: boolean;
  created_at: string;
  last_login: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [profile, setProfile] = useState<UserProfile>({
    id: '123',
    email: 'demo@example.com',
    full_name: 'Sarah Mitchell',
    experience_level: 'Intermediate',
    preferred_style: 'Vinyasa Flow',
    practice_frequency: '3-4 times per week',
    focus_areas: ['Core & Balance', 'Flexibility', 'Mindfulness'],
    notifications_enabled: true,
    created_at: '2024-01-15T08:00:00Z',
    last_login: '2024-01-21T14:30:00Z'
  });

  const yogaStyles = [
    'Vinyasa Flow',
    'Hatha',
    'Ashtanga',
    'Yin',
    'Power Yoga',
    'Restorative',
    'Mixed Styles'
  ];

  const practiceFrequencies = [
    'Daily',
    '4-6 times per week',
    '3-4 times per week',
    '1-2 times per week',
    'Occasionally'
  ];

  const focusAreaOptions = [
    'Core & Balance',
    'Flexibility',
    'Strength',
    'Mindfulness',
    'Breath Work',
    'Stress Relief',
    'Back Care',
    'Energy & Vitality'
  ];

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }

        // In a real app, we would fetch the user's profile here
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-8"
      >
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Your Account
          </h1>
          <p className="text-xl text-gray-400">
            Manage your profile and preferences
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300">
            {successMessage}
          </div>
        )}

        <div className="space-y-6 bg-gray-800/50 backdrop-blur-lg p-6 rounded-2xl border border-white/10">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Profile Information</h2>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Full Name
              </label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          <div className="space-y-4 pt-6">
            <h2 className="text-2xl font-semibold text-white">Yoga Preferences</h2>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Experience Level
              </label>
              <select
                value={profile.experience_level}
                onChange={(e) => setProfile({ ...profile, experience_level: e.target.value as UserProfile['experience_level'] })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Preferred Style
              </label>
              <select
                value={profile.preferred_style}
                onChange={(e) => setProfile({ ...profile, preferred_style: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {yogaStyles.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Practice Frequency
              </label>
              <select
                value={profile.practice_frequency}
                onChange={(e) => setProfile({ ...profile, practice_frequency: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {practiceFrequencies.map(frequency => (
                  <option key={frequency} value={frequency}>{frequency}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Focus Areas
              </label>
              <div className="grid grid-cols-2 gap-2">
                {focusAreaOptions.map(area => (
                  <label key={area} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={profile.focus_areas.includes(area)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setProfile({
                            ...profile,
                            focus_areas: [...profile.focus_areas, area]
                          });
                        } else {
                          setProfile({
                            ...profile,
                            focus_areas: profile.focus_areas.filter(a => a !== area)
                          });
                        }
                      }}
                      className="rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-white/5"
                    />
                    <span className="text-gray-300">{area}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6">
            <h2 className="text-2xl font-semibold text-white">Preferences</h2>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">
                Email Notifications
              </label>
              <button
                onClick={() => setProfile({ ...profile, notifications_enabled: !profile.notifications_enabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  profile.notifications_enabled ? 'bg-blue-500' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    profile.notifications_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="px-6 py-2 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-colors"
            >
              Sign Out
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl px-6 py-3 font-medium hover:from-blue-600 hover:to-purple-600 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                'Save Changes'
              )}
            </motion.button>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Member since {new Date(profile.created_at).toLocaleDateString()}</p>
          <p>Last login: {new Date(profile.last_login).toLocaleString()}</p>
        </div>
      </motion.div>
    </div>
  );
} 