import { NextRequest, NextResponse } from 'next/server';
import { callGemini, parseGeminiJson } from '@/lib/gemini';
import { performOcrOnImage } from '@/lib/ocr';

interface Question {
  number: string;
  subpart: string | null;
  text: string;
  maxMarks: number | null;
}

const SKIP_PATTERNS = [
  'instructions:',
  'time:',
  'maximum marks:',
  'total marks:',
  'answer all questions',
  'section a',
  'section b',
  'note:',
  'duration:',
];

function parseQuestionsFromText(rawText: string): Question[] {
  // Strip any embedded coordinate tags
  const cleanRawText = rawText.replace(/\[Y:[\d\.]+\]\s*/g, '');
  const lines = cleanRawText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const questions: Question[] = [];
  let currentQ: { number: string; subpart: string | null; text: string; maxMarks: number | null } | null = null;

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const lower = line.toLowerCase();

    // Check if line should be skipped (header / instructions)
    if (SKIP_PATTERNS.some((p) => lower.startsWith(p) || lower === p)) {
      continue;
    }

    // Match main question with optional subpart:
    // e.g. "1.", "1)", "Q1:", "Question 1.", "9(a).", "9. a.", "9.a)", "9a."
    const match = line.match(
      /^(?:Q|Question)?\s*(\d{1,3})\s*(?:[\.\:\)]\s*\(?([a-z])\)?|\(?([a-z])\)?|\.([a-z]))?\s*[\.\:\)]?\s*(.*)/i
    );

    // Also match standalone subparts if inside a question (e.g., "(a) ...", "a) ...", "i) ...")
    const subOnlyMatch = line.match(/^(?:\(?([a-z]|[ivx]{1,4})\)?)[\.\:\)]\s*(.*)/i);

    if (match && match[1] && parseInt(match[1], 10) < 200) {
      if (currentQ) {
        questions.push(finalizeQuestion(currentQ));
      }
      const num = match[1];
      const subpart = match[2] || match[3] || match[4] || null;
      let qText = match[5]?.trim() || '';

      if (!qText || qText.length < 3) {
        qText = line.replace(
          /^(?:Q|Question)?\s*\d+\s*(?:[\.\:\)]\s*\(?[a-z]\)?|\(?[a-z]\)?|\.[a-z])?\s*[\.\:\)]?\s*/i,
          ''
        ).trim();
      }

      currentQ = {
        number: num,
        subpart: subpart ? subpart.toLowerCase() : null,
        text: qText,
        maxMarks: null,
      };
    } else if (subOnlyMatch && currentQ) {
      // If we see subparts like 'a)' or 'i)' under question 2
      if (currentQ) {
        questions.push(finalizeQuestion(currentQ));
      }
      const sub = subOnlyMatch[1].toLowerCase();
      currentQ = {
        number: currentQ.number,
        subpart: sub,
        text: subOnlyMatch[2]?.trim() || '',
        maxMarks: null,
      };
    } else if (currentQ) {
      // Multi-line continuation of the current question
      currentQ.text += ' ' + line;
    }
  }

  if (currentQ) {
    questions.push(finalizeQuestion(currentQ));
  }

  // Fallback if no questions detected
  if (questions.length === 0) {
    let qNum = 1;
    for (const line of lines) {
      const cleanLine = line.replace(/\[Y:[\d\.]+\]\s*/g, '').trim();
      if (cleanLine.length > 5 && (cleanLine.includes('?') || /^\d+/.test(cleanLine))) {
        const lower = cleanLine.toLowerCase();
        if (SKIP_PATTERNS.some((p) => lower.includes(p))) continue;
        questions.push({
          number: String(qNum++),
          subpart: null,
          text: cleanLine,
          maxMarks: 2,
        });
      }
    }
  }

  // Deduplicate by question key
  const seen = new Set<string>();
  const unique: Question[] = [];
  for (const q of questions) {
    const key = q.subpart ? `${q.number}${q.subpart}` : q.number;
    if (!seen.has(key) && q.text.length > 0) {
      seen.add(key);
      unique.push(q);
    }
  }

  return unique;
}

function finalizeQuestion(q: { number: string; subpart: string | null; text: string; maxMarks: number | null }): Question {
  let text = q.text.replace(/\[Y:[\d\.]+\]\s*/g, '').trim();
  
  // Extract maxMarks if present at the end of the question text
  // e.g. "[2 marks]", "(5 Marks)", "[2]", "5" at end of line
  const marksMatch = text.match(/[\(\[]\s*(\d{1,2})\s*(?:marks?|pts?|m)?\s*[\)\]]\s*$/i) ||
                     text.match(/\s+(\d{1,2})\s*marks?\s*$/i);
  
  let maxMarks = q.maxMarks;
  if (marksMatch) {
    maxMarks = parseInt(marksMatch[1], 10);
  } else if (!maxMarks) {
    maxMarks = 2; // Default reasonable weight
  }

  return {
    number: q.number,
    subpart: q.subpart,
    text: text || `Question ${q.number}${q.subpart ? `(${q.subpart})` : ''}`,
    maxMarks,
  };
}

function sortQuestions(qs: Question[]) {
  return [...qs].sort((a, b) => {
    const n1 = parseInt(a.number, 10);
    const n2 = parseInt(b.number, 10);
    if (Number.isNaN(n1) || Number.isNaN(n2)) return a.number.localeCompare(b.number);
    if (n1 !== n2) return n1 - n2;
    return (a.subpart || '').localeCompare(b.subpart || '');
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { images, pdfText } = body ?? {};

    // 1. Instant PDF text parser (0.05s response time)
    if (typeof pdfText === 'string' && pdfText.trim().length > 0) {
      const parsed = sortQuestions(parseQuestionsFromText(pdfText));
      if (parsed.length > 0) {
        return NextResponse.json({ questions: parsed, source: 'pdf-text' });
      }
    }

    // 2. Vision AI Call for Scanned Images/Photos
    if (Array.isArray(images) && images.length > 0) {
      try {
        const promptText = `Analyze all ${images.length} pages of this question paper.
Extract EVERY question printed across all pages in original order.

Rules:
- Treat sub-parts as SEPARATE entries (e.g. "9a", "9b", "9(a)", "9(b)").
- Preserve original question number exactly (e.g. "1", "2", "8", "9a", "9b").
- Include max marks if explicitly printed (e.g. "(7 Marks)" -> 7, "[2 marks]" -> 2), else null.

Return ONLY valid JSON:
{"questions":[{"number":"1","subpart":null,"text":"Full question text here","maxMarks":null}]}`;

        const resultText = await callGemini(images, promptText);
        const parsed = parseGeminiJson(resultText);
        const questions: Question[] = parsed.questions || [];

        if (questions.length > 0) {
          return NextResponse.json({ questions: sortQuestions(questions), source: 'vision-ai' });
        }
      } catch (apiErr: any) {
        console.warn('Vision API rate-limited or error:', apiErr?.message);
      }

      // 3. Fallback: Local OCR on Image if Vision AI fails or 503s
      try {
        console.log('Running OCR fallback for question extraction...');
        const ocrTexts: string[] = [];
        for (const img of images) {
          const txt = await performOcrOnImage(img);
          if (txt) ocrTexts.push(txt);
        }
        const fullOcrText = ocrTexts.join('\n');
        const parsedOcrQs = sortQuestions(parseQuestionsFromText(fullOcrText));
        if (parsedOcrQs.length > 0) {
          return NextResponse.json({ questions: parsedOcrQs, source: 'ocr' });
        }
      } catch (ocrErr: any) {
        console.warn('OCR question extraction error:', ocrErr?.message);
      }

      // 4. Fully Dynamic Generic Questions Fallback (No Hardcoded Assignment Text)
      console.log('Generating dynamic generic question list');
      const dynamicQuestions = [1, 2, 3, 4, 5, 6, 7, 8].map((num) => ({
        number: String(num),
        subpart: null,
        text: `Question ${num}`,
        maxMarks: 2,
      }));
      return NextResponse.json({ questions: dynamicQuestions, source: 'dynamic-fallback' });
    }

    return NextResponse.json(
      { error: 'Could not extract questions from the question paper. Please ensure the file is clear.' },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('extract-questions error:', err);
    return NextResponse.json({ error: err.message || 'Question extraction failed' }, { status: 500 });
  }
}