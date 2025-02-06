'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;

      // Set profile with user email from session
      setProfile({
        ...profileData,
        email: session.user.email || '',
        focus_areas: profileData.focus_areas || [],
        last_login: session.user.last_sign_in_at || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setIsSaving(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          experience_level: profile.experience_level,
          preferred_style: profile.preferred_style,
          practice_frequency: profile.practice_frequency,
          focus_areas: profile.focus_areas,
          notifications_enabled: profile.notifications_enabled
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
      toast.error('Failed to update profile');
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
      toast.error('Failed to sign out');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground mb-6">Failed to load profile</p>
          <button
            onClick={() => router.push('/login')}
            className="brutalist-button-primary"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your profile and preferences
          </p>
        </div>

        <div className="brutalist-card space-y-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-xl font-bold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="brutalist-input opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="brutalist-input"
                />
              </div>
            </div>
          </div>

          {/* Yoga Experience */}
          <div>
            <h2 className="text-xl font-bold mb-4">Yoga Experience</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Experience Level</label>
                <select
                  value={profile.experience_level || 'Beginner'}
                  onChange={(e) => setProfile({ ...profile, experience_level: e.target.value as UserProfile['experience_level'] })}
                  className="brutalist-input"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Preferred Style</label>
                <input
                  type="text"
                  value={profile.preferred_style || ''}
                  onChange={(e) => setProfile({ ...profile, preferred_style: e.target.value })}
                  placeholder="e.g., Vinyasa, Hatha, Yin"
                  className="brutalist-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Practice Frequency</label>
                <input
                  type="text"
                  value={profile.practice_frequency || ''}
                  onChange={(e) => setProfile({ ...profile, practice_frequency: e.target.value })}
                  placeholder="e.g., 2-3 times per week"
                  className="brutalist-input"
                />
              </div>
            </div>
          </div>

          {/* Focus Areas */}
          <div>
            <h2 className="text-xl font-bold mb-4">Focus Areas</h2>
            <div className="space-y-2">
              {['Strength', 'Flexibility', 'Balance', 'Core', 'Relaxation'].map((area) => (
                <label key={area} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={profile.focus_areas?.includes(area) || false}
                    onChange={(e) => {
                      const newFocusAreas = e.target.checked
                        ? [...(profile.focus_areas || []), area]
                        : (profile.focus_areas || []).filter(a => a !== area);
                      setProfile({ ...profile, focus_areas: newFocusAreas });
                    }}
                    className="rounded border-white/10 bg-white/5"
                  />
                  <span>{area}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h2 className="text-xl font-bold mb-4">Notifications</h2>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={profile.notifications_enabled}
                onChange={(e) => setProfile({ ...profile, notifications_enabled: e.target.checked })}
                className="rounded border-white/10 bg-white/5"
              />
              <span>Enable email notifications</span>
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <button
              onClick={handleLogout}
              className="brutalist-button-secondary"
            >
              Sign Out
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="brutalist-button-primary"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 