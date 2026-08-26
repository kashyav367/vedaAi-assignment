import { NextRequest, NextResponse } from 'next/server';
import { callGemini, parseGeminiJson } from '@/lib/gemini';
import { QUESTION_EXTRACTION_PROMPT } from '@/lib/prompt';

export async function POST(req: NextRequest) {
  try {
    const { images } = await req.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    const resultText = await callGemini(images, QUESTION_EXTRACTION_PROMPT);
    const parsed = parseGeminiJson(resultText);

    return NextResponse.json({ questions: parsed.questions || [] });
  } catch (err: any) {
    console.error('extract-questions error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
