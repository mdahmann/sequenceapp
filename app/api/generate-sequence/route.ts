import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL
});

// Common transitions between pose types
const TRANSITION_PATTERNS = {
  standing_to_standing: [
    "Step feet together at the top of the mat",
    "Ground through all four corners of the feet",
    "Engage the leg muscles and find stability"
  ],
  standing_to_seated: [
    "Slowly fold forward and place hands on the mat",
    "Step or hop back to sit",
    "Lower down with control"
  ],
  seated_to_standing: [
    "Press hands into the mat and engage core",
    "Step or hop to the top of the mat",
    "Roll up to standing with a flat back"
  ],
  standing_to_prone: [
    "Forward fold and step back to plank",
    "Lower knees, chest, and chin with control",
    "Release hips to the mat"
  ],
  prone_to_standing: [
    "Press into hands and lift chest",
    "Tuck toes and lift hips to downward dog",
    "Step or hop to the top of the mat"
  ]
};

export async function POST(req: Request) {
  try {
    const { sequence, focus = [], level, duration, customPrompt, available_poses } = await req.json();

    // Ensure focus is an array
    const focusAreas = Array.isArray(focus) ? focus : [focus].filter(Boolean);

    // Calculate number of poses based on duration
    const poseTimeMap = {
      'Beginner': 90, // seconds
      'Intermediate': 60,
      'Expert': 45
    };
    const poseTime = poseTimeMap[level as keyof typeof poseTimeMap] || 60;
    const targetPoseCount = Math.floor((duration * 60) / poseTime);

    const systemPrompt = `You are an experienced yoga instructor creating a ${duration}-minute ${level} level sequence.
The sequence should include approximately ${targetPoseCount} poses to maintain an appropriate pace.
${focusAreas.length > 0 ? `Focus areas: ${focusAreas.join(', ')}` : ''}

Key Sequencing Rules:
1. Start with centering/breathing (2-3 minutes)
2. Warm-up (15-20% of sequence)
   - Include Sun Salutations or gentle flowing sequences
   - Build heat progressively
3. Standing poses (30-35% of sequence)
   - Start with basic standing poses
   - Progress to more challenging ones
   - Include balancing poses when appropriate
4. Peak poses/challenging sequences (20-25%)
   - Build up with preparatory poses
   - Include counter-poses after challenging poses
5. Floor work (15-20%)
   - Include seated poses, twists
   - Progress to backbends or inversions if appropriate
6. Cool-down (10-15%)
   - Gentle forward folds
   - Hip openers
   - Twists
7. Final relaxation (5-10 minutes)

Transition Guidelines:
1. Flow smoothly between poses
2. Use vinyasa transitions between standing sequences
3. Minimize jumping between different pose types
4. Include specific breath cues
5. Account for both sides when poses are asymmetrical

Available Poses: ${JSON.stringify(available_poses)}

Respond with a JSON object containing:
{
  "sequence": [pose IDs in order],
  "timing": [specific timing for each pose],
  "transitions": [detailed transition instructions],
  "repetitions": {
    "pose_id": {
      "repeat": number of repetitions,
      "note": "instruction for repetition"
    }
  }
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: customPrompt || `Create a ${duration}-minute ${level} level sequence${focusAreas.length > 0 ? ` focused on ${focusAreas.join(', ')}` : ''}.`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse and validate the response
    const parsedResponse = JSON.parse(response);
    
    // Ensure we have all required fields
    const result = {
      sequence: parsedResponse.sequence || [],
      timing: parsedResponse.timing || [],
      transitions: parsedResponse.transitions || [],
      repetitions: parsedResponse.repetitions || {}
    };

    // Validate sequence length
    if (result.sequence.length < targetPoseCount * 0.8) {
      // If sequence is too short, add complementary poses
      const complementaryPoses = await getComplementaryPoses(
        result.sequence,
        targetPoseCount - result.sequence.length,
        available_poses,
        level,
        focusAreas
      );
      result.sequence = [...result.sequence, ...complementaryPoses];
      
      // Add default timing and transitions for new poses
      for (let i = result.timing.length; i < result.sequence.length; i++) {
        result.timing.push(getDefaultTiming(level));
        if (i > 0) {
          result.transitions.push(getDefaultTransition(
            getPoseCategory(result.sequence[i - 1], available_poses),
            getPoseCategory(result.sequence[i], available_poses)
          ));
        }
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating sequence:', error);
    return NextResponse.json(
      { error: 'Failed to generate sequence' },
      { status: 500 }
    );
  }
}

// Helper functions
function getDefaultTiming(level: string): string {
  const timings = {
    'Beginner': '5-8 breaths',
    'Intermediate': '5 breaths',
    'Expert': '3-5 breaths'
  };
  return timings[level as keyof typeof timings] || '5 breaths';
}

function getPoseCategory(poseId: number, poses: any[]): string {
  const pose = poses.find(p => p.id === poseId);
  return pose?.category_name || 'unknown';
}

function getDefaultTransition(fromCategory: string, toCategory: string): string {
  const key = `${fromCategory.toLowerCase()}_to_${toCategory.toLowerCase()}`;
  const transitions = TRANSITION_PATTERNS[key as keyof typeof TRANSITION_PATTERNS];
  if (transitions) {
    return transitions[Math.floor(Math.random() * transitions.length)];
  }
  return "Move mindfully to the next pose";
}

async function getComplementaryPoses(
  currentSequence: number[],
  posesNeeded: number,
  availablePoses: any[],
  level: string,
  focus: string[]
): Promise<number[]> {
  // Filter available poses by level and exclude poses already in sequence
  const eligiblePoses = availablePoses.filter(pose => 
    pose.difficulty_level === level &&
    !currentSequence.includes(pose.id)
  );

  // Prioritize poses that match focus areas
  const focusPoses = eligiblePoses.filter(pose =>
    focus.some(f => 
      pose.category_name.toLowerCase().includes(f.toLowerCase()) ||
      pose.english_name.toLowerCase().includes(f.toLowerCase())
    )
  );

  // Combine focus poses with other eligible poses and take what we need
  const complementaryPoses = [...focusPoses, ...eligiblePoses]
    .slice(0, posesNeeded)
    .map(pose => pose.id);

  return complementaryPoses;
} 