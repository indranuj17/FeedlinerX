import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai/prompts';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST() {
  try {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content:
          "You're a creative assistant. Generate 3 open-ended, engaging anonymous questions for a friendly messaging platform. Format them in a single string separated by '||'. Avoid personal or sensitive topics.",
      },
      {
        role: 'user',
        content: 'Generate the questions now.',
      },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages,
    });

    const stream = OpenAIStream(response);

    return new StreamingTextResponse(stream);
  } catch (error: any) {
    console.error('Error generating messages:', error);
    return new Response(
      JSON.stringify({
        message: error?.message || 'Unexpected error occurred',
      }),
      { status: 500 }
    );
  }
}
