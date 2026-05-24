import { generateQuestionPaper } from '@/lib/ai';
import { extractSourceFromUpload } from '@/lib/ai/extractSourceContent';
import { formatProviderError } from '@/lib/ai/config';
import type { GenerationInput } from '@/lib/ai';
import type { QuestionTypeConfig } from '@/types';

export const maxDuration = 120;

const MAX_FILE_BYTES = 10 * 1024 * 1024;

interface GenerateBody {
  title?: string;
  subject?: string;
  dueDate?: string;
  questionTypes?: QuestionTypeConfig[];
  additionalInstructions?: string;
}

function parseBody(raw: string): GenerateBody {
  return JSON.parse(raw) as GenerateBody;
}

async function buildInput(
  body: GenerateBody,
  sourceText?: string
): Promise<GenerationInput> {
  if (!body.dueDate) {
    throw new Error('Due date is required');
  }
  if (!body.questionTypes?.length) {
    throw new Error('At least one question type is required');
  }

  const title =
    body.title?.trim() ||
    (body.dueDate
      ? `Assignment — ${new Date(body.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`
      : 'Question Paper');

  return {
    title,
    subject: body.subject?.trim(),
    dueDate: body.dueDate,
    questionTypes: body.questionTypes,
    additionalInstructions: body.additionalInstructions?.trim(),
    sourceText,
  };
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: GenerateBody;
    let sourceText: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      const dataField = form.get('data');
      if (typeof dataField !== 'string') {
        return Response.json({ error: 'Missing form data' }, { status: 400 });
      }
      body = parseBody(dataField);

      const file = form.get('file');
      if (file instanceof File && file.size > 0) {
        if (file.size > MAX_FILE_BYTES) {
          return Response.json(
            { error: 'File must be under 10MB' },
            { status: 400 }
          );
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        sourceText = await extractSourceFromUpload(
          buffer,
          file.type || 'application/octet-stream',
          file.name
        );
      }
    } else {
      body = (await request.json()) as GenerateBody;
    }

    const input = await buildInput(body, sourceText);
    const result = await generateQuestionPaper(input);
    const { usedMockAi, ...paper } = result;
    const id = `local-${crypto.randomUUID()}`;

    return Response.json({
      id,
      status: 'completed',
      paper,
      usedMockAi: usedMockAi ?? false,
      usedSourceMaterial: Boolean(sourceText),
    });
  } catch (err) {
    const message = formatProviderError(err);
    const status = /401|invalid api key/i.test(message) ? 401 : 500;
    return Response.json({ error: message }, { status });
  }
}
