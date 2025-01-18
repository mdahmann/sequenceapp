import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { current_pose, sequence, available_poses } = body;

    // Construct the prompt for OpenAI
    const systemPrompt = `You are a knowledgeable yoga instructor tasked with suggesting a replacement pose. 
The current pose is:
- Name: ${current_pose.name} (${current_pose.sanskrit_name})
- Difficulty: ${current_pose.difficulty}
- Category: ${current_pose.category}
- Description: ${current_pose.description}

The pose appears in the following sequence context:
${JSON.stringify(sequence.map((p: any) => ({ name: p.name, sanskrit_name: p.sanskrit_name })), null, 2)}

Consider the following when suggesting a replacement:
1. Maintain the flow and progression of the sequence
2. Keep a similar difficulty level
3. Choose a pose that targets similar areas or provides similar benefits
4. Ensure the transition from the previous pose and to the next pose remains smooth

AVAILABLE POSES:
${JSON.stringify(available_poses, null, 2)}

Respond with a JSON object containing:
1. "pose_id": The ID of the suggested replacement pose
2. "explanation": A brief explanation of why this pose is a good replacement

Example:
{
  "pose_id": 12,
  "explanation": "This pose provides similar hip opening benefits while maintaining the standing position, making it a natural transition in the sequence."
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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
      pose_id: parsedResponse.pose_id,
      explanation: parsedResponse.explanation
    });
  } catch (error) {
    console.error('Error suggesting pose:', error);
    return NextResponse.json(
      { error: 'Failed to suggest pose' },
      { status: 500 }
    );
  }
} 