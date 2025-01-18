import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { YogaPose } from '@/lib/data/poses';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL
});

interface PoseWithDetails {
  id: number;
  name: string;
  sanskrit_name: string;
  difficulty: string;
  category: string;
  description: string;
}

export async function POST(req: Request) {
  try {
    const { sequence, available_poses, focus, level } = await req.json();

    // Create a simpler mapping of poses by category and difficulty
    const posesByCategory: { [key: string]: PoseWithDetails[] } = {};
    available_poses.forEach((pose: PoseWithDetails) => {
      if (!posesByCategory[pose.category]) {
        posesByCategory[pose.category] = [];
      }
      posesByCategory[pose.category].push(pose);
    });

    // For each pose in the sequence, find 2-3 similar poses from the same category and difficulty
    const alternatives: { [key: number]: number[] } = {};
    
    sequence.forEach((pose: YogaPose) => {
      const similarPoses = available_poses.filter((p: PoseWithDetails) => 
        p.id !== pose.id && // Not the same pose
        p.difficulty === pose.difficulty_level && // Same difficulty
        p.category === pose.category_name && // Same category
        !sequence.some((seqPose: YogaPose) => seqPose.id === p.id) // Not already in sequence
      );

      if (similarPoses.length > 0) {
        // Take up to 3 similar poses
        alternatives[pose.id] = similarPoses
          .slice(0, 3)
          .map((p: PoseWithDetails) => p.id);
      }
    });

    // If we have very few alternatives, try to find poses from related categories
    const relatedCategories: { [key: string]: string[] } = {
      'Standing Poses': ['Balance Poses', 'Standing Forward Folds'],
      'Seated Poses': ['Hip Openers', 'Seated Forward Folds'],
      'Backbends': ['Core Work', 'Prone Poses'],
      'Forward Folds': ['Seated Poses', 'Standing Forward Folds'],
      'Twists': ['Seated Poses', 'Standing Poses'],
      'Inversions': ['Arm Balances', 'Core Work'],
      'Arm Balances': ['Inversions', 'Core Work'],
      'Core Work': ['Arm Balances', 'Prone Poses']
    };

    sequence.forEach((pose: YogaPose) => {
      if (!alternatives[pose.id] || alternatives[pose.id].length < 2) {
        const related = relatedCategories[pose.category_name] || [];
        const relatedPoses = available_poses.filter((p: PoseWithDetails) =>
          p.id !== pose.id &&
          p.difficulty === pose.difficulty_level &&
          related.includes(p.category) &&
          !sequence.some((seqPose: YogaPose) => seqPose.id === p.id)
        );

        if (relatedPoses.length > 0) {
          alternatives[pose.id] = [
            ...(alternatives[pose.id] || []),
            ...relatedPoses.slice(0, 2).map((p: PoseWithDetails) => p.id)
          ].slice(0, 3);
        }
      }
    });

    return NextResponse.json({ alternatives });
  } catch (error) {
    console.error('Error generating pose alternatives:', error);
    return NextResponse.json(
      { error: 'Failed to generate pose alternatives', alternatives: {} },
      { status: 500 }
    );
  }
} 