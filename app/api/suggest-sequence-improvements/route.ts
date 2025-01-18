import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL
});

export async function POST(req: Request) {
  try {
    const { sequence, focus, level, duration, customPrompt } = await req.json();

    const systemPrompt = `You are a yoga sequence analyzer. Analyze the given sequence and provide 3 concise suggestions for improvements.
Each suggestion should be in this exact format:
Title | Brief description

The title should be 2-4 words, action-oriented, and clear.
The description should be 1-2 sentences, concise and specific.
Do not use special characters or emojis.
Focus on practical, actionable improvements.

Example format:
Add Balancing Poses | Incorporate Tree Pose and Eagle Pose to improve balance and focus.
Extend Cool Down | Add 2-3 minutes of final relaxation poses to complete the practice.

Current sequence details:
- Duration: ${duration} minutes
- Level: ${level}
- Focus Areas: ${focus.join(', ')}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: customPrompt || `Analyze this yoga sequence and suggest improvements: ${sequence.map(pose => pose.english_name).join(', ')}` }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const suggestions = response.choices[0].message.content
      ?.split('\n')
      .filter(line => line.includes('|'))
      .map(suggestion => {
        const [title, description] = suggestion.split('|').map(s => s.trim());
        return `${title} | ${description}`;
      }) || [];

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
} 