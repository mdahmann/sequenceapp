import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const { sequence, focus, level, duration, customPrompt } = await req.json();

    const prompt = `As an expert yoga instructor, analyze this ${duration}-minute ${level} level yoga sequence${focus.length > 0 ? ` focused on ${focus.join(' & ')}` : ''} and provide exactly 3 suggestions for improvement.

Create 3 unique suggestions, each with a descriptive title followed by a brief explanation. The title should be specific and capture the essence of the improvement, like these examples:
- "Progressive Core Integration: Add plank variations..."
- "Mindful Inversion Preparation: Include gentle shoulder openers..."
- "Dynamic Hip Opening Flow: Build up to deeper stretches..."

Current sequence:
${sequence.map((pose: any) => pose.english_name).join(' → ')}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an experienced yoga instructor. Provide exactly 3 suggestions, each with a descriptive title that captures the specific improvement. Each suggestion should be in the format 'Descriptive Title: Brief explanation'. Do not include labels like 'Title:' or 'Brief description:' - just provide the actual title and explanation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const suggestions = response.choices[0].message.content
      ?.split('\n')
      .filter(line => line.trim().length > 0 && line.includes(':'))
      .map(line => line.trim());

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
} 