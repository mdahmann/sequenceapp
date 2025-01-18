import { NextResponse } from 'next/server';
import OpenAI from 'openai';

interface AvailablePose {
  id: number;
  name: string;
  sanskrit_name: string;
  difficulty: string;
  category_name: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      current_sequence,
      focus_areas,
      level,
      poses_needed,
      target_duration_minutes,
      available_poses 
    } = body;

    // Construct the prompt for OpenAI
    const systemPrompt = `You are a knowledgeable yoga instructor tasked with selecting complementary poses to complete a sequence.

The current sequence has ${current_sequence.length} poses and needs ${poses_needed} more poses to reach the target duration of ${target_duration_minutes} minutes.

FOCUS AREAS: ${focus_areas.join(', ')}
DIFFICULTY LEVEL: ${level}

Consider the following when selecting complementary poses:
1. Maintain the flow and progression of the sequence
2. Keep the difficulty level appropriate (${level})
3. Choose poses that complement the existing sequence
4. Consider the balance of different pose categories
5. Ensure the sequence remains cohesive
6. Select poses that align with the focus areas when possible

AVAILABLE POSES:
${JSON.stringify(available_poses.map((p: AvailablePose) => ({
  id: p.id,
  name: p.name,
  sanskrit_name: p.sanskrit_name,
  difficulty: p.difficulty,
  category: p.category_name
})), null, 2)}

CURRENT SEQUENCE:
${JSON.stringify(current_sequence.map((id: number) => {
  const pose = available_poses.find((p: AvailablePose) => p.id === id);
  return pose ? {
    name: pose.name,
    sanskrit_name: pose.sanskrit_name,
    difficulty: pose.difficulty,
    category: pose.category_name
  } : null;
}).filter(Boolean), null, 2)}

Respond with a JSON object containing:
1. "poses": Array of pose IDs to add to the sequence
2. "explanation": Brief explanation of why these poses were selected

Example:
{
  "poses": [12, 15, 8],
  "explanation": "Added gentle standing poses to maintain flow and target leg strength, followed by a restorative pose to cool down."
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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

    // Parse the response
    const parsedResponse = JSON.parse(response);
    
    return NextResponse.json({
      poses: parsedResponse.poses,
      explanation: parsedResponse.explanation
    });
  } catch (error) {
    console.error('Error getting complementary poses:', error);
    return NextResponse.json(
      { error: 'Failed to get complementary poses' },
      { status: 500 }
    );
  }
} 