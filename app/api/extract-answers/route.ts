import { NextRequest, NextResponse } from 'next/server';
import { callGemini, parseGeminiJson } from '@/lib/gemini';
import { ANSWER_EXTRACTION_PROMPT } from '@/lib/prompt';

function normalizeQKey(str: string): string {
  if (!str) return '';
  return str.toString().toLowerCase().replace(/^q(?:uestion)?\s*/i, '').replace(/[^a-z0-9]/g, '');
}

function extractKeyFromText(text: string, questionNumber: string, expectedKeys: string[]): string {
  const normExpected = expectedKeys.map(normalizeQKey);
  const textStr = (text || '').trim();
  const qNumStr = (questionNumber || '').trim();

  for (const expectedKey of expectedKeys) {
    const normKey = normalizeQKey(expectedKey);
    const subpartMatch = expectedKey.match(/^(\d+)([a-z])$/i);

    if (subpartMatch) {
      const num = subpartMatch[1];
      const sub = subpartMatch[2].toLowerCase();
      const regex = new RegExp(`^(?:q(?:uestion)?\\s*)?${num}\\s*[\\.\\(-]?\\s*\\(?${sub}\\)?[\\.\\)\\s]`, 'i');
      if (regex.test(textStr)) {
        return normKey;
      }
    } else {
      const regex = new RegExp(`^(?:q(?:uestion)?\\s*)?${expectedKey}[\\.\\)\\s]`, 'i');
      if (regex.test(textStr)) {
        return normKey;
      }
    }
  }

  const parenSubMatch = textStr.match(/^(?:q(?:uestion)?\s*)?(\d+)\s*[\.\(-]?\s*\(([a-z])\)/i);
  if (parenSubMatch) {
    const key = normalizeQKey(parenSubMatch[1] + parenSubMatch[2]);
    if (normExpected.length === 0 || normExpected.includes(key)) return key;
  }

  const numMatch = textStr.match(/^(?:q(?:uestion)?\s*)?(\d+)[\.\)\s]/i);
  if (numMatch) {
    const key = normalizeQKey(numMatch[1]);
    if (normExpected.length === 0 || normExpected.includes(key)) return key;
  }

  const qNumNorm = normalizeQKey(qNumStr);
  if (normExpected.includes(qNumNorm)) {
    return qNumNorm;
  }

  return '';
}

export async function POST(req: NextRequest) {
  try {
    const { images, questions } = await req.json(); 

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    const expectedQuestions = (questions || []).map((q: any) =>
      q.subpart ? `${q.number}${q.subpart}` : `${q.number}`
    );
    const normExpected = expectedQuestions.map(normalizeQKey);

    const promptText = typeof ANSWER_EXTRACTION_PROMPT === 'function' 
      ? ANSWER_EXTRACTION_PROMPT(expectedQuestions) 
      : ANSWER_EXTRACTION_PROMPT;

    const allAnswers: any[] = [];
    let globalIdx = 0;
    for (let i = 0; i < images.length; i++) {
      const resultText = await callGemini([images[i]], promptText);
      const parsed = parseGeminiJson(resultText);
      let pageAnswers = (parsed.answers || []).map((a: any) => ({ ...a, page: i + 1 }));
      
      let answerBlocks = pageAnswers.filter((a: any) => {
        const y = a.bbox?.y || 0;
        const txt = (a.text || '').toLowerCase();
        if (y < 12 && (txt.includes('student answer sheet') || txt.includes('roll no') || txt.includes('class:'))) {
          return false;
        }
        return true;
      });

      answerBlocks.sort((a: any, b: any) => (a.bbox?.y || 0) - (b.bbox?.y || 0));

      answerBlocks = answerBlocks.map((a: any) => {
        const textKey = extractKeyFromText(a.text, a.questionNumber, expectedQuestions);

        if (textKey && normExpected.includes(textKey)) {
          globalIdx = normExpected.indexOf(textKey) + 1;
          return { ...a, questionNumber: textKey };
        }

        if (globalIdx < expectedQuestions.length) {
          const posKey = normExpected[globalIdx];
          globalIdx++;
          return { ...a, questionNumber: posKey };
        }

        return a;
      });

      // 4. Dynamically adjust bbox height to cover 100% of the full paragraph space down to next question
      answerBlocks = answerBlocks.map((a: any, idx: number) => {
        const currentY = a.bbox?.y || 0;
        let fullHeight: number;
        if (idx < answerBlocks.length - 1) {
          const nextY = answerBlocks[idx + 1].bbox?.y || (currentY + 10);
          fullHeight = Math.max(a.bbox?.height || 5, nextY - currentY - 0.4);
        } else {
          fullHeight = Math.max(a.bbox?.height || 6, 98.5 - currentY);
        }
        return {
          ...a,
          bbox: {
            x: a.bbox?.x || 5,
            y: currentY,
            width: a.bbox?.width || 90,
            height: Math.min(30, fullHeight),
          },
        };
      });

      allAnswers.push(...answerBlocks);
    }

    console.log('FINAL MAPPING:', JSON.stringify(allAnswers.map(a => ({ 
      q: a.questionNumber, 
      y: a.bbox?.y,
      h: a.bbox?.height,
      textStart: a.text?.slice(0, 35) 
    })), null, 2));

    return NextResponse.json({ answers: allAnswers });
  } catch (err: any) {
    console.error('extract-answers error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}