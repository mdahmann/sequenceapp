import OpenAI from 'openai';

// Ensure API key is available
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL
});

export interface SequenceGenerationParams {
  duration: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Expert';
  focus?: string;
  style?: string;
}

export async function generateYogaSequence(params: SequenceGenerationParams) {
  try {
    const { duration, difficulty, focus, style } = params;

    const systemPrompt = `You are a knowledgeable yoga instructor creating personalized sequences. 
Use proper Sanskrit names along with English names for poses. 
Consider proper sequencing, warm-up requirements, and cool-down periods.
Format the response in a clear, structured way with sections for:
1. Warm-up
2. Main sequence
3. Cool-down
Include timing for each pose and clear transition instructions.`;

    const userPrompt = `Create a ${duration}-minute yoga sequence for ${difficulty} level practitioners.${
      focus ? ` The sequence should focus on ${focus}.` : ''
    }${style ? ` The style should be ${style}.` : ''}
    
Include specific poses from our database, timing for each pose, and transitions between poses.
Each pose should include:
- English and Sanskrit names
- Duration to hold
- Clear transition instructions
- Brief alignment cues`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      presence_penalty: 0.3,
      frequency_penalty: 0.3,
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error('No sequence generated');
    }

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating sequence:', error);
    throw new Error('Failed to generate sequence. Please try again.');
  }
}

export async function generatePoseDescription(poseName: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a yoga instructor providing detailed, anatomically accurate descriptions of yoga poses. Include proper alignment cues, benefits, and contraindications."
        },
        {
          role: "user",
          content: `Provide a detailed description of ${poseName} (including its Sanskrit name if applicable). Include proper alignment, benefits, and any precautions.`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error('No description generated');
    }

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating pose description:', error);
    throw new Error('Failed to generate pose description. Please try again.');
  }
}

export async function suggestModifications(poseName: string, condition: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a yoga instructor providing safe modifications for poses based on specific conditions or limitations."
        },
        {
          role: "user",
          content: `Suggest modifications for ${poseName} for someone with ${condition}. Include props that might be helpful and alternative poses if needed.`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error('No modifications generated');
    }

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating modifications:', error);
    throw new Error('Failed to generate modifications. Please try again.');
  }
} 