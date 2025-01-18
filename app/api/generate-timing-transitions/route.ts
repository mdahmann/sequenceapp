import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sequence, duration, level, target_duration_minutes } = body;

    // Construct the prompt for OpenAI
    const systemPrompt = `You are a knowledgeable yoga instructor tasked with creating timing and transitions for a ${duration}-minute yoga sequence.

The sequence contains ${sequence.length} poses and should take approximately ${target_duration_minutes} minutes to complete.

DIFFICULTY LEVEL: ${level}

Consider the following when creating timing and transitions:
1. Each pose should have an appropriate duration based on its difficulty and purpose
2. Include breath cues in the transitions
3. Account for both sides when poses are asymmetrical
4. Create mini-flows or sequences that can be repeated
5. Balance static holds with dynamic movements
6. Ensure smooth transitions between poses
7. Account for proper warm-up and cool-down timing

Respond with a JSON object containing:
1. "timing": Array of timing instructions for each pose (e.g., "5 breaths", "30 seconds", "1 minute")
2. "transitions": Array of transition instructions between poses
3. "repetitions": Object mapping pose IDs or sequences to repetition instructions

Example:
{
  "timing": ["5 breaths", "30 seconds", "1 minute"],
  "transitions": ["Exhale to fold forward", "Roll up to standing", "Step right foot back"],
  "repetitions": {
    "1": {"repeat": 3, "note": "Complete 3 rounds of Sun Salutation A"},
    "4-7-2": {"repeat": 2, "note": "Flow through this sequence twice per side"}
  }
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
      timing: parsedResponse.timing || [],
      transitions: parsedResponse.transitions || [],
      repetitions: parsedResponse.repetitions || {}
    });
  } catch (error) {
    console.error('Error generating timing and transitions:', error);
    return NextResponse.json(
      { error: 'Failed to generate timing and transitions' },
      { status: 500 }
    );
  }
} 