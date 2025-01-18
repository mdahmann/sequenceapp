import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import { YogaPose } from '@/lib/data/poses';
import PoseNavigator from '@/components/PoseNavigator';

async function getPoseData() {
  try {
    // Use anon key for public access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Load poses from Supabase
    const { data: poses, error: posesError } = await supabase
      .from('poses')
      .select('*');

    if (posesError) throw posesError;

    // Extract unique categories from poses
    const categories = Array.from(new Set(poses.map((pose: YogaPose) => pose.category_name)));

    return {
      poses: poses as YogaPose[],
      categories: categories as string[]
    };
  } catch (error) {
    console.error('Error loading pose data:', error);
    return {
      poses: [],
      categories: []
    };
  }
}

export default async function PosesPage() {
  const { poses, categories } = await getPoseData();

  if (!poses || poses.length === 0) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8">Pose Library</h1>
          <p className="text-gray-400">No poses found. Please check the database connection.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="container mx-auto max-w-7xl">
        <PoseNavigator poses={poses} categories={categories} />
      </div>
    </main>
  );
} 