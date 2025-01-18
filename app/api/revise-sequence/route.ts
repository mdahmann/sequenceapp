import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL
});

export async function POST(req: Request) {
  try {
    const { sequence, suggestion, customPrompt, focus, level, duration, available_poses } = await req.json();

    const prompt = customPrompt || `As an expert yoga instructor, revise this ${duration}-minute ${level} level yoga sequence${focus.length > 0 ? ` focused on ${focus.join(' & ')}` : ''} based on the following suggestion:

"${suggestion}"

Current sequence with IDs:
${sequence.map((pose: any) => `${pose.english_name} (ID: ${pose.id})`).join(' → ')}

Available pose IDs: ${available_poses.map((pose: any) => pose.id).join(', ')}

IMPORTANT: You must rearrange, reorder, or modify the sequence to implement the suggested improvement. Simply returning the same sequence is not acceptable. Make meaningful changes while following these rules:
1. Only use pose IDs from the list provided above
2. Keep the sequence length similar (within 2-3 poses)
3. Maintain the overall focus and difficulty level
4. Each pose should have a specific timing cue and transition instruction

Provide your response in the following JSON format:
{
  "sequence": [pose IDs in new order - must be different from original sequence],
  "timing": [
    "Hold for 5 breaths",
    "Hold for 3 breaths",
    etc...
  ],
  "transitions": [
    "Inhale, step right foot forward between hands",
    "Exhale, press back to plank position",
    etc...
  ],
  "repetitions": {
    "pose_id": {
      "count": number of repetitions,
      "notes": "any special instructions"
    }
  }
}

IMPORTANT: For transitions, provide ONLY the movement instructions. Do not include pose names or IDs. For example:
✓ "Inhale, lift your arms overhead and bend knees deeply"
✓ "Exhale, fold forward and place hands on the mat"
✗ "From Warrior II (ID: 48) to Triangle (ID: 21): Step forward..."
✗ "From Mountain Pose to Forward Fold: Hinge at hips..."`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an experienced yoga instructor with deep knowledge of sequencing, alignment, and flow. When providing transitions, give only the movement instructions without mentioning pose names or IDs. Focus on breath cues and physical movements that guide the student from one position to the next."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const revisedSequence = JSON.parse(response.choices[0].message.content || '{}');

    return NextResponse.json(revisedSequence);
  } catch (error) {
    console.error('Error revising sequence:', error);
    return NextResponse.json(
      { error: 'Failed to revise sequence' },
      { status: 500 }
    );
  }
} 