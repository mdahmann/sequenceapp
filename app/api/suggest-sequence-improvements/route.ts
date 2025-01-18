import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { YogaPose } from '@/lib/data/poses';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL
});

export async function POST(req: Request) {
  try {
    const { sequence, focus, level, duration, customPrompt } = await req.json();

    const systemPrompt = `You are a yoga sequence analyzer. Analyze the given sequence and suggest improvements.
Consider:
- The sequence duration (${duration} minutes)
- Difficulty level (${level})
- Focus areas (${focus.join(', ')})

Provide 3-4 suggestions in this format:
"Title | Brief description"

Example:
"Add Child's Pose | Include a resting pose after the challenging backbend sequence"

Keep titles short (2-4 words) and descriptions concise (1-2 sentences). No special characters or emojis.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: customPrompt || `Analyze this yoga sequence and suggest improvements: ${sequence.map((pose: YogaPose) => pose.english_name).join(', ')}` }
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content in response');
    }

    return NextResponse.json({ suggestions: content });
  } catch (error) {
    console.error('Error analyzing sequence:', error);
    return NextResponse.json(
      { error: 'Failed to analyze sequence', suggestions: [] },
      { status: 500 }
    );
  }
} 