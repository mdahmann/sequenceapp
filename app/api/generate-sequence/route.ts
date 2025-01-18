import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { focus_poses, duration, difficulty_level, focus_areas, available_poses } = body;

    // Ensure focus_areas is always an array of clean strings
    const parsedFocusAreas = (Array.isArray(focus_areas) ? focus_areas : [])
      .filter(Boolean)
      .map(area => typeof area === 'string' ? area.trim() : '')
      .filter(Boolean);

    // Calculate number of poses based on duration (roughly one pose every 5 minutes)
    const numPoses = Math.floor(duration / 5);

    // Construct the prompt for OpenAI
    const systemPrompt = `You are a knowledgeable yoga instructor tasked with creating a ${duration}-minute yoga sequence. 
The sequence should include approximately ${numPoses} poses, considering the following:

${focus_poses.length > 0 ? `FOCUS POSES:
${focus_poses.map((pose: { name: string; sanskrit_name: string; difficulty: string; category: string; description: string }, index: number) => `
${index + 1}. ${pose.name} (${pose.sanskrit_name})
   - Difficulty: ${pose.difficulty}
   - Category: ${pose.category}
   - Description: ${pose.description}`).join('\n')}

These poses should be integrated naturally into the sequence, with proper preparation and counter-poses. Space them appropriately throughout the sequence to maintain flow and balance.` : ''}

DIFFICULTY LEVEL: ${difficulty_level}
Based on the ${difficulty_level.toLowerCase()} level:
- For Beginner: Focus on foundational poses with clear alignment cues. Include mostly beginner poses (70-80%) with some intermediate poses (20-30%) when appropriate for progression.
- For Intermediate: Create a balanced mix of beginner (30-40%) and intermediate poses (50-60%), with occasional advanced poses (10-20%) for challenge and growth.
- For Expert: Design a challenging sequence with a mix of intermediate (40-50%) and advanced poses (40-50%), while maintaining some foundational poses (10-20%) for proper warm-up and cool-down.

${parsedFocusAreas.length > 0 ? `FOCUS AREAS: ${parsedFocusAreas.join(', ')}
The sequence should emphasize these areas while maintaining a balanced practice.` : ''}

SEQUENCE REQUIREMENTS:
1. Start with gentle warm-up poses appropriate for the level
2. Gradually build intensity and complexity
3. Include preparation poses before challenging poses
4. Space the focus poses appropriately throughout the sequence
5. Include counter-poses after challenging poses
6. End with cooling and restorative poses
7. Maintain a natural flow between poses
8. Balance different types of poses (standing, seated, twists, etc.)
9. Consider the anatomical and energetic progression

SEQUENCE STRUCTURE:
1. Opening/Centering (2-3 minutes)
2. Warm-up poses (15-20% of sequence)
3. Build-up poses (20-25% of sequence)
4. Peak poses including focus poses (30-35% of sequence)
5. Counter-poses and cool-down (20-25% of sequence)
6. Final relaxation (2-3 minutes)

AVAILABLE POSES:
${JSON.stringify(available_poses, null, 2)}

Respond with a JSON object containing a "sequence" array of pose IDs in the correct order. Example:
{
  "sequence": [1, 4, 7, 2, 9]
}

The sequence should create a cohesive flow that meets all the specified requirements while maintaining appropriate difficulty progression for the selected level.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: systemPrompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the response and extract the sequence
    const parsedResponse = JSON.parse(response);
    
    return NextResponse.json({
      sequence: parsedResponse.sequence || []
    });
  } catch (error) {
    console.error('Error generating sequence:', error);
    return NextResponse.json(
      { error: 'Failed to generate sequence' },
      { status: 500 }
    );
  }
} 