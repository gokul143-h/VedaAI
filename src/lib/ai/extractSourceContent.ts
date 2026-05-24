import 'server-only';

import OpenAI from 'openai';
import { aiConfig, isAuthError } from './config';

const MAX_SOURCE_CHARS = 12_000;

function createClient(): OpenAI {
  return new OpenAI({
    apiKey: aiConfig.apiKey,
    baseURL: aiConfig.baseUrl,
  });
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);
    return (data.text || '').replace(/\s+/g, ' ').trim();
  } catch (err) {
    console.warn('[AI] PDF parse failed:', err);
    return '';
  }
}

async function extractImageWithOcr(buffer: Buffer): Promise<string> {
  try {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng');
    try {
      const {
        data: { text },
      } = await worker.recognize(buffer);
      return (text || '').replace(/\s+/g, ' ').trim();
    } finally {
      await worker.terminate();
    }
  } catch (err) {
    console.warn('[AI] OCR unavailable (common on Vercel):', err);
    return '';
  }
}

async function extractImageWithVision(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const client = createClient();
  const base64 = buffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const completion = await client.chat.completions.create({
    model: aiConfig.visionModel,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You are extracting study material from an uploaded image for a teacher.
Transcribe ALL readable text (headings, paragraphs, labels, captions, bullet points).
Summarize diagrams or charts briefly if they contain no text.
Output plain text only — no markdown fences.`,
          },
          {
            type: 'image_url',
            image_url: { url: dataUrl },
          },
        ],
      },
    ],
    temperature: 0.2,
    max_tokens: 4096,
  });

  return (completion.choices[0]?.message?.content || '').trim();
}

async function extractImageText(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (aiConfig.apiKey) {
    try {
      const visionText = await extractImageWithVision(buffer, mimeType);
      if (visionText) return visionText;
    } catch (err) {
      if (!isAuthError(err)) {
        console.warn('[AI] Vision failed, using local OCR:', err);
      }
    }
  }

  return extractImageWithOcr(buffer);
}

export async function extractSourceFromUpload(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<string> {
  const lower = fileName.toLowerCase();
  let text = '';

  if (mimeType === 'application/pdf' || lower.endsWith('.pdf')) {
    text = await extractPdfText(buffer);
  } else if (
    mimeType.startsWith('image/') ||
    /\.(jpe?g|png)$/i.test(lower)
  ) {
    const imageMime = mimeType.startsWith('image/')
      ? mimeType
      : lower.endsWith('.png')
        ? 'image/png'
        : 'image/jpeg';
    text = await extractImageText(buffer, imageMime);
  } else {
    throw new Error('Unsupported file type. Upload PDF, JPEG, or PNG.');
  }

  const normalized = text.replace(/\s{2,}/g, ' ').trim();
  if (!normalized) {
    return `[Uploaded file: ${fileName}. Generate questions using the teacher instructions and general subject knowledge.]`;
  }

  return normalized.slice(0, MAX_SOURCE_CHARS);
}
