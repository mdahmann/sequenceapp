import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { YogaPose } from '@/lib/data/poses';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL
});

interface Suggestion {
  title: string;
  description: string;
}

export async function POST(req: Request) {
  try {
    const { sequence, focus, level, duration, customPrompt } = await req.json();

    const systemPrompt = `You are a yoga sequence analyzer. Analyze the given sequence and suggest improvements.
Consider:
- The sequence duration (${duration} minutes)
- Difficulty level (${level})
- Focus areas (${focus.join(', ')})\n
Your response must be a JSON object with this exact format:
{
  "suggestions": [
    {
      "title": "Add Child's Pose",
      "description": "Include a resting pose after the challenging backbend sequence"
    }
  ]
}

Provide 3-4 suggestions. Keep titles short (2-4 words) and descriptions concise (1-2 sentences). No special characters or emojis.`;

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

    // Parse the JSON response
    const data = JSON.parse(content);
    
    // Validate the response format
    if (!data.suggestions || !Array.isArray(data.suggestions)) {
      throw new Error('Invalid response format');
    }

    // Format suggestions to ensure they match expected structure
    const formattedSuggestions = data.suggestions.map((suggestion: Partial<Suggestion>) => ({
      title: suggestion.title || '',
      description: suggestion.description || ''
    }));

    return NextResponse.json({ suggestions: formattedSuggestions });
  } catch (error) {
    console.error('Error analyzing sequence:', error);
    return NextResponse.json(
      { error: 'Failed to analyze sequence', suggestions: [] },
      { status: 500 }
    );
  }
} 