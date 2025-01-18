import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sequence, available_poses, level } = body;

    // Construct the prompt for OpenAI
    const systemPrompt = `You are a knowledgeable yoga instructor tasked with suggesting poses to add to a sequence. 

The current sequence is:
${JSON.stringify(sequence.map((p: any) => ({ name: p.english_name, sanskrit_name: p.sanskrit_name })), null, 2)}

The sequence difficulty level is: ${level}

Consider the following when suggesting poses to add:
1. Maintain the flow and progression of the sequence
2. Keep the difficulty level appropriate (${level})
3. Choose poses that would enhance the sequence
4. Consider the balance of different pose categories
5. Ensure smooth transitions would be possible

AVAILABLE POSES:
${JSON.stringify(available_poses.map((p: any) => ({
  id: p.id,
  name: p.english_name,
  sanskrit_name: p.sanskrit_name,
  difficulty: p.difficulty_level,
  category: p.category_name
})), null, 2)}

Respond with a JSON object containing:
1. "pose_ids": Array of 2 pose IDs that would be good additions
2. "explanations": Array of brief explanations for why each pose would be a good addition

Example:
{
  "pose_ids": [12, 15],
  "explanations": [
    "This standing pose would help build heat and prepare for more challenging poses",
    "This gentle twist would help balance the sequence and improve spinal mobility"
  ]
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
      pose_ids: parsedResponse.pose_ids,
      explanations: parsedResponse.explanations
    });
  } catch (error) {
    console.error('Error suggesting poses:', error);
    return NextResponse.json(
      { error: 'Failed to suggest poses' },
      { status: 500 }
    );
  }
} 