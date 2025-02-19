'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { YogaPose } from '@/types/YogaPose';
import { toast } from 'react-hot-toast';
import CustomPoseForm from '@/components/CustomPoseForm';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function AdminPosesPage() {
  const router = useRouter();
  const [poses, setPoses] = useState<YogaPose[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPose, setEditingPose] = useState<YogaPose | null>(null);
  const [deletingPose, setDeletingPose] = useState<YogaPose | null>(null);

  useEffect(() => {
    checkAuth();
    loadPoses();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    // Check if user is in admin_users table
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', session.user.id)
      .single();

    if (error || !adminUser) {
      router.push('/');
      return;
    }
  };

  const loadPoses = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('poses')
        .select('*')
        .order('category_name', { ascending: true })
        .order('english_name', { ascending: true });

      if (error) throw error;

      setPoses(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load poses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    // Define headers
    const headers = [
      'English Name',
      'Sanskrit Name',
      'Sanskrit Name (Adapted)',
      'Translation Name',
      'Category',
      'Difficulty Level',
      'Description',
      'Benefits'
    ];

    // Convert poses to CSV rows
    const csvRows = poses.map(pose => [
      pose.english_name,
      pose.sanskrit_name,
      pose.sanskrit_name_adapted,
      pose.translation_name,
      pose.category_name,
      pose.difficulty_level,
      pose.pose_description,
      pose.pose_benefits
    ]);

    // Add headers to the beginning
    csvRows.unshift(headers);

    // Convert to CSV string (handling commas and quotes in content)
    const csvString = csvRows.map(row => 
      row.map(cell => {
        // If cell contains commas, quotes, or newlines, wrap in quotes and escape existing quotes
        if (cell && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell || '';
      }).join(',')
    ).join('\n');

    // Create blob and download
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `yoga_poses_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleAddPose = async (pose: Omit<YogaPose, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('poses')
        .insert([pose])
        .select()
        .single();

      if (error) throw error;

      setPoses([...poses, data]);
      setShowAddForm(false);
      toast.success('Pose added successfully');
    } catch (err: any) {
      toast.error('Failed to add pose');
      console.error('Error adding pose:', err);
    }
  };

  const handleEditPose = async (updatedPose: Omit<YogaPose, 'id'>) => {
    if (!editingPose) return;

    try {
      const { data, error } = await supabase
        .from('poses')
        .update(updatedPose)
        .eq('id', editingPose.id)
        .select()
        .single();

      if (error) throw error;

      setPoses(poses.map(p => p.id === editingPose.id ? data : p));
      setEditingPose(null);
      toast.success('Pose updated successfully');
    } catch (err: any) {
      toast.error('Failed to update pose');
      console.error('Error updating pose:', err);
    }
  };

  const handleDeletePose = async () => {
    if (!deletingPose) return;

    try {
      const { error } = await supabase
        .from('poses')
        .delete()
        .eq('id', deletingPose.id);

      if (error) throw error;

      setPoses(poses.filter(p => p.id !== deletingPose.id));
      setDeletingPose(null);
      toast.success('Pose deleted successfully');
    } catch (err: any) {
      toast.error('Failed to delete pose');
      console.error('Error deleting pose:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Yoga Poses Database</h1>
        <div className="flex justify-center items-center gap-4 mt-4">
          <p className="text-muted-foreground">Total poses: {poses.length}</p>
          <button
            onClick={handleExportCSV}
            className="brutalist-button-secondary text-sm"
          >
            Export as CSV
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="brutalist-button-primary text-sm"
          >
            Add New Pose
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-3 px-6 text-center">English Name</th>
              <th className="py-3 px-6 text-center">Sanskrit Name</th>
              <th className="py-3 px-6 text-center">Sanskrit Name (Adapted)</th>
              <th className="py-3 px-6 text-center">Translation Name</th>
              <th className="py-3 px-6 text-center">Category</th>
              <th className="py-3 px-6 text-center">Difficulty</th>
              <th className="py-3 px-6 text-center">Description</th>
              <th className="py-3 px-6 text-center">Benefits</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {poses.map((pose) => (
              <tr
                key={pose.id}
                className="border-b border-white/10 hover:bg-white/5"
              >
                <td className="py-4 px-6 text-center">{pose.english_name}</td>
                <td className="py-4 px-6 text-center">{pose.sanskrit_name}</td>
                <td className="py-4 px-6 text-center">{pose.sanskrit_name_adapted}</td>
                <td className="py-4 px-6 text-center">{pose.translation_name}</td>
                <td className="py-4 px-6 text-center">{pose.category_name}</td>
                <td className="py-4 px-6 text-center">
                  <span className={`inline-block px-2 py-1 rounded text-xs ${
                    pose.difficulty_level === 'Beginner' ? 'bg-green-500/20 text-green-300' :
                    pose.difficulty_level === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {pose.difficulty_level}
                  </span>
                </td>
                <td className="py-4 px-6 text-center whitespace-pre-wrap">
                  {pose.pose_description}
                </td>
                <td className="py-4 px-6 text-center whitespace-pre-wrap">
                  {pose.pose_benefits}
                </td>
                <td className="py-4 px-6 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setEditingPose(pose)}
                      className="p-2 rounded hover:bg-white/10 transition-colors"
                      title="Edit pose"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeletingPose(pose)}
                      className="p-2 rounded hover:bg-red-500/20 transition-colors text-red-400"
                      title="Delete pose"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddForm && (
        <CustomPoseForm
          onSubmit={handleAddPose}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {editingPose && (
        <CustomPoseForm
          pose={editingPose}
          onSubmit={handleEditPose}
          onClose={() => setEditingPose(null)}
        />
      )}

      {deletingPose && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setDeletingPose(null)}
          onConfirm={handleDeletePose}
          title="Delete Pose"
          message={`Are you sure you want to delete ${deletingPose.english_name}? This action cannot be undone.`}
        />
      )}
    </div>
  );
} 