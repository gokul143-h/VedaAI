import { getAiHealthInfo } from '@/lib/ai';

export async function GET() {
  return Response.json(getAiHealthInfo());
}
