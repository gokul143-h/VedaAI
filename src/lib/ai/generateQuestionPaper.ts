import 'server-only';
import OpenAI from 'openai';
import { aiConfig, isAuthError } from './config';
import { buildGenerationPrompt, usesSourceDrivenStyle } from './promptBuilder';
import { parseAndValidatePaper } from './paperParser';
import { generateMockPaper } from './mockPaper';
import type { GeneratedPaper } from '@/types';
import type { GenerationInput } from './types';

function createClient(): OpenAI | null {
  if (!aiConfig.apiKey) return null;
  return new OpenAI({
    apiKey: aiConfig.apiKey,
    baseURL: aiConfig.baseUrl,
  });
}

async function callLlm(system: string, user: string): Promise<string> {
  const client = createClient();
  if (!client) {
    throw new Error('No API key configured');
  }

  const completion = await client.chat.completions.create({
    model: aiConfig.model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error('Empty response from AI');
  return raw;
}

export async function generateQuestionPaper(
  input: GenerationInput
): Promise<GeneratedPaper & { usedMockAi?: boolean }> {
  if (aiConfig.useMock) {
    await new Promise((r) => setTimeout(r, 800));
    return { ...generateMockPaper(input), usedMockAi: true };
  }

  const prompt = buildGenerationPrompt(input);
  const fromSource = usesSourceDrivenStyle(input);
  const system = fromSource
    ? 'You create quiz and study questions from uploaded text. Output only valid JSON. Each question is one direct sentence — no intros, no section round labels, no markdown.'
    : 'You are an expert academic assessment designer. Output only valid JSON. No markdown, no commentary.';

  try {
    const raw = await callLlm(system, prompt);
    return parseAndValidatePaper(raw, input);
  } catch (err) {
    if (isAuthError(err)) {
      console.warn(
        '[AI] Invalid API key — falling back to mock paper. Fix GROQ_API_KEY in .env.local'
      );
      await new Promise((r) => setTimeout(r, 500));
      return { ...generateMockPaper(input), usedMockAi: true };
    }
    throw err;
  }
}
