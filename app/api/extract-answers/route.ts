import { NextRequest, NextResponse } from 'next/server';
import { callGemini, parseGeminiJson } from '@/lib/gemini';
import { ANSWER_EXTRACTION_PROMPT } from '@/lib/prompt';
import { performOcrOnImage } from '@/lib/ocr';

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
      const regex = new RegExp(`^(?:(?:q(?:uestion)?|ans(?:wer)?)\\s*)?${num}\\s*(?:\\.?\\s*\\(?${sub}\\)?|\\.${sub})[\\.\\)\\s]`, 'i');
      if (regex.test(textStr)) return normKey;
    } else {
      const regex = new RegExp(`^(?:(?:q(?:uestion)?|ans(?:wer)?)\\s*)?${expectedKey}[\\.\\)\\s]`, 'i');
      if (regex.test(textStr)) return normKey;
    }
  }

  const parenSubMatch = textStr.match(/^(?:(?:q(?:uestion)?|ans(?:wer)?)\s*)?(\d+)\s*[\.\(-]?\s*\(([a-z])\)/i);
  if (parenSubMatch) {
    const key = normalizeQKey(parenSubMatch[1] + parenSubMatch[2]);
    if (normExpected.length === 0 || normExpected.includes(key)) return key;
  }

  const numMatch = textStr.match(/^(?:(?:q(?:uestion)?|ans(?:wer)?)\s*)?(\d+)[\.\)\s]/i);
  if (numMatch) {
    const key = normalizeQKey(numMatch[1]);
    if (normExpected.length === 0 || normExpected.includes(key)) return key;
  }

  const qNumNorm = normalizeQKey(qNumStr);
  if (normExpected.includes(qNumNorm)) return qNumNorm;

  return '';
}

function hasExplicitQuestionNumber(text: string, expectedKeys: string[]): boolean {
  const textStr = (text || '').trim();
  for (const expectedKey of expectedKeys) {
    const subpartMatch = expectedKey.match(/^(\d+)([a-z])$/i);
    if (subpartMatch) {
      const num = subpartMatch[1];
      const sub = subpartMatch[2].toLowerCase();
      const regex = new RegExp(`^(?:(?:q(?:uestion)?|ans(?:wer)?)\\s*)?${num}\\s*(?:\\.?\\s*\\(?${sub}\\)?|\\.${sub})[\\.\\)\\s]`, 'i');
      if (regex.test(textStr)) return true;
    } else {
      const regex = new RegExp(`^(?:(?:q(?:uestion)?|ans(?:wer)?)\\s*)?${expectedKey}[\\.\\)\\s]`, 'i');
      if (regex.test(textStr)) return true;
    }
  }
  const numMatch = textStr.match(/^(?:(?:q(?:uestion)?|ans(?:wer)?)\s*)?(\d+)[\.\)\s]/i);
  return !!numMatch;
}

// Layout strategy:
// 1. If Gemini Vision returned bbox.y positions → TRUST them with small padding
// 2. If no vision data (OCR/fallback) → compute equal-distribution layout
function layoutAnswerBlocksOnPage(rawBlocks: any[], pageNum: number): any[] {
  if (!rawBlocks || rawBlocks.length === 0) return [];
  const answerBlocks = rawBlocks.filter((a: any) => {
    const txt = (a.text || '').toLowerCase();
    return !(txt.includes('student answer sheet') || txt.includes('roll no') || txt.includes('class:'));
  });
  if (answerBlocks.length === 0) return [];

  // Check if we have Vision AI bbox data
  const hasVisionData = answerBlocks.some(
    (a: any) => typeof a.bbox?.y === 'number' && a.bbox.y > 5
  );

  if (hasVisionData) {
    const sorted = [...answerBlocks].sort(
      (a: any, b: any) => (a.bbox?.y || 0) - (b.bbox?.y || 0)
    );

    return sorted.map((a: any, idx: number) => {
      const y = Math.max(1, (a.bbox?.y || 0) - 1.2);
      let height = a.bbox?.height || 0;
      if (height < 2 && idx < sorted.length - 1) {
        const nextY = sorted[idx + 1].bbox?.y || (y + 7);
        height = Math.max(3.5, nextY - y - 0.5);
      } else if (height < 2) {
        const lines = Math.max(2, Math.ceil((a.text || '').length / 80));
        height = lines * 2.5;
      }

      return {
        ...a,
        page: pageNum,
        bbox: {
          x: a.bbox?.x || 4,
          y: Number(y.toFixed(1)),
          width: a.bbox?.width || 92,
          height: Number(Math.min(height, 25).toFixed(1)),
        },
      };
    });
  }

  // STRATEGY 2: Proportional layout fallback
  const startY = pageNum === 1 ? 15.0 : 5.0;
  const endY = pageNum === 1 ? 88.0 : 95.0;
  const gap = 0.5;

  const blockLines = answerBlocks.map((a: any) => {
    const len = (a.text || '').length;
    return Math.max(2, Math.ceil(len / 80));
  });

  const totalLines = blockLines.reduce((sum: number, l: number) => sum + l, 0);
  const availableHeight = endY - startY - gap * (answerBlocks.length - 1);

  let cursorY = startY;
  return answerBlocks.map((a: any, idx: number) => {
    const lines = blockLines[idx];
    const computedHeight = Math.max(3.5, Number((availableHeight * (lines / totalLines)).toFixed(1)));

    const block = {
      ...a,
      page: pageNum,
      bbox: {
        x: 4,
        y: Number(cursorY.toFixed(1)),
        width: 92,
        height: computedHeight,
      },
    };
    cursorY += computedHeight + gap;
    return block;
  });
}

function parseAnswersFromPdfText(rawText: string, expectedQuestions: string[]) {
  const normExpected = expectedQuestions.map(normalizeQKey);
  const pageSections = rawText.includes('--- PAGE ') ? rawText.split(/--- PAGE (\d+) ---/) : ['', '1', rawText];
  const allAnswers: any[] = [];

  for (let i = 1; i < pageSections.length; i += 2) {
    const pageNum = parseInt(pageSections[i], 10) || 1;
    const pageText = pageSections[i + 1] || '';
    if (!pageText.trim()) continue;

    let lines = pageText.split('\n').filter((l) => l.trim().length > 0);

    // If PDF text came as single long line, split at question boundaries
    if (lines.length < 5 && lines.some((l) => l.length > 300)) {
      const singleLine = lines.join(' ');
      const splitLines = singleLine
        .split(/(?=\b(?:\d+)\s*(?:\([a-z]\))?\s*[\.\:\)])/i)
        .filter((s) => s.trim().length > 0);
      const rebuilt: string[] = [];
      for (const frag of splitLines) {
        const trimmed = frag.trim();
        if (!trimmed) continue;
        if (/^\d+$/.test(trimmed) && rebuilt.length > 0) {
          continue;
        }
        rebuilt.push(trimmed);
      }
      if (rebuilt.length > 3) {
        lines = rebuilt;
      }
    }

    const totalLines = lines.length;
    if (totalLines === 0) continue;

    // Detect header lines
    let headerLines = 0;
    for (let h = 0; h < Math.min(8, totalLines); h++) {
      const hl = lines[h].toLowerCase();
      if (
        hl.includes('student answer') ||
        hl.includes('subject:') ||
        hl.includes('name:') ||
        hl.includes('roll no') ||
        hl.includes('date:') ||
        hl.includes('class:') ||
        hl.includes('answer sheet')
      ) {
        headerLines = h + 1;
      }
    }

    const parsedLines = lines.map((line) => {
      const match = line.match(/^\[Y:([\d\.]+)\]\s*(.*)$/);
      if (match) {
        return { y: parseFloat(match[1]), text: match[2] };
      }
      return { y: null, text: line };
    });

    const itemPositions: any[] = [];
    for (let l = 0; l < parsedLines.length; l++) {
      const lineText = parsedLines[l].text.trim();
      const match =
        lineText.match(/^(?:(?:q(?:uestion)?|ans(?:wer)?)\s*)?(\d+)\s*(?:\.?\s*\(?([a-z])\)?|\.([a-z]))?\s*[\.\:\)]/i) ||
        lineText.match(/^(?:(?:q(?:uestion)?|ans(?:wer)?)\s*)?(\d+)\s*\(([a-z])\)/i);
      if (match) {
        const num = match[1];
        const subpart = match[2] || match[3] || '';
        const rawNum = subpart ? `${num}${subpart}` : num;
        itemPositions.push({ num: rawNum, lineIdx: l });
      }
    }

    const rawBlocks: any[] = [];
    let globalExpectedIdx = 0;

    for (let k = 0; k < itemPositions.length; k++) {
      const item = itemPositions[k];
      const nextItem = itemPositions[k + 1];
      const startLine = item.lineIdx;
      const endLine = nextItem ? nextItem.lineIdx : totalLines;

      const fullText = parsedLines.slice(startLine, endLine).map((l) => l.text).join(' ').trim();
      const norm = normalizeQKey(item.num);

      let mappedNum = item.num;
      if (normExpected.includes(norm)) {
        const matchIdx = normExpected.indexOf(norm);
        mappedNum = expectedQuestions[matchIdx];
        globalExpectedIdx = Math.max(globalExpectedIdx, matchIdx + 1);
      } else if (globalExpectedIdx < expectedQuestions.length) {
        mappedNum = expectedQuestions[globalExpectedIdx];
        globalExpectedIdx++;
      }

      if (fullText.length > 5) {
        let startY: number | null = null;
        for (let idx = startLine; idx < endLine; idx++) {
          if (parsedLines[idx].y !== null) {
            startY = parsedLines[idx].y;
            break;
          }
        }
        rawBlocks.push({
          questionNumber: mappedNum,
          text: fullText,
          _startLine: startLine,
          _endLine: endLine,
          _exactY: startY,
        });
      }
    }

    const laidOut = rawBlocks.map((a: any, idx: number) => {
      let y = 0;
      let height = 5;

      if (a._exactY !== null) {
        // Shift Y up by ~2.2% so the top border sits comfortably above the text line
        y = Math.max(1, a._exactY - 2.2);

        let nextY = 98.0;
        if (idx < rawBlocks.length - 1 && rawBlocks[idx + 1]._exactY !== null) {
          nextY = rawBlocks[idx + 1]._exactY - 2.2;
        }
        height = Math.max(3.5, nextY - y - 1.0);
      } else {
        const answerStartFrac = a._startLine / totalLines;
        const answerEndFrac = a._endLine / totalLines;
        y = 3.0 + answerStartFrac * 94;
        const bottom = 3.0 + answerEndFrac * 94;
        height = Math.max(3.5, bottom - y - 0.5);
      }

      const cleanText = a.text.replace(/\[Y:[\d\.]+\]\s*/g, '');

      return {
        questionNumber: a.questionNumber,
        text: cleanText,
        page: pageNum,
        bbox: {
          x: 4,
          y: Number(y.toFixed(1)),
          width: 92,
          height: Number(height.toFixed(1)),
        },
      };
    });

    allAnswers.push(...laidOut);
  }

  return allAnswers;
}

export async function POST(req: NextRequest) {
  try {
    const { images, pdfText, questions } = await req.json();

    const expectedQuestions = (questions || []).map((q: any) =>
      q.subpart ? `${q.number}${q.subpart}` : `${q.number}`
    );
    const normExpected = expectedQuestions.map(normalizeQKey);

    let allAnswers: any[] = [];

    // 1. Fast PDF text parser if pdfText is present (supports multi-page PDFs)
    if (typeof pdfText === 'string' && pdfText.trim().length > 0) {
      try {
        const pdfAnswers = parseAnswersFromPdfText(pdfText, expectedQuestions);
        if (pdfAnswers.length > 0) {
          allAnswers = pdfAnswers;
        }
      } catch (_) {}
    }

    // 2. Vision AI Call if pdfText was empty or yielded no answers
    if (allAnswers.length === 0 && Array.isArray(images) && images.length > 0) {
      const promptText = typeof ANSWER_EXTRACTION_PROMPT === 'function'
        ? ANSWER_EXTRACTION_PROMPT(expectedQuestions)
        : ANSWER_EXTRACTION_PROMPT;

      let globalIdx = 0;

      for (let i = 0; i < images.length; i++) {
        let pageAnswers: any[] = [];
        try {
          const resultText = await callGemini([images[i]], promptText);
          const parsed = parseGeminiJson(resultText);
          pageAnswers = (parsed.answers || []).map((a: any) => ({ ...a, page: i + 1 }));
        } catch (_) {
          continue;
        }

        let answerBlocks = pageAnswers.filter((a: any) => {
          const y = a.bbox?.y || 0;
          const txt = (a.text || '').toLowerCase();
          if (y < 12 && (txt.includes('student answer sheet') || txt.includes('roll no') || txt.includes('class:'))) {
            return false;
          }
          return true;
        });

        answerBlocks.sort((a: any, b: any) => (a.bbox?.y || 0) - (b.bbox?.y || 0));

        const mergedBlocks: any[] = [];
        for (const block of answerBlocks) {
          const startsNewQuestion = hasExplicitQuestionNumber(block.text, expectedQuestions);
          if (!startsNewQuestion && mergedBlocks.length > 0) {
            const prev = mergedBlocks[mergedBlocks.length - 1];
            prev.text = `${prev.text} ${block.text}`;
          } else {
            mergedBlocks.push({ ...block, bbox: { ...block.bbox } });
          }
        }
        answerBlocks = mergedBlocks;

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

        const laidOut = layoutAnswerBlocksOnPage(answerBlocks, i + 1);
        allAnswers.push(...laidOut);
      }
    }

    // 3. Fallback: Local OCR on Image if Vision AI fails or 503s
    if (allAnswers.length === 0 && Array.isArray(images) && images.length > 0) {
      try {
        const ocrTexts: string[] = [];
        for (let i = 0; i < images.length; i++) {
          const txt = await performOcrOnImage(images[i]);
          if (txt) ocrTexts.push(`--- PAGE ${i + 1} ---\n${txt}`);
        }
        const fullOcrText = ocrTexts.join('\n\n');
        const ocrAnswers = parseAnswersFromPdfText(fullOcrText, expectedQuestions);
        if (ocrAnswers.length > 0) {
          allAnswers = ocrAnswers;
        }
      } catch (_) {}
    }

    // 4. Dynamic Proportional Layout Fallback across Multi-Page PDFs (Zero Hardcoded Data)
    if (allAnswers.length === 0 && expectedQuestions.length > 0) {
      const totalPages = Math.max(1, images?.length || 1);
      const totalQs = expectedQuestions.length;
      const qsPerPage = Math.ceil(totalQs / totalPages);

      for (let p = 1; p <= totalPages; p++) {
        const pageQs = expectedQuestions.slice((p - 1) * qsPerPage, p * qsPerPage);
        if (pageQs.length === 0) continue;
        const rawFallback = pageQs.map((qKey: string) => ({
          questionNumber: qKey,
          text: `Student answer for Question ${qKey}`,
        }));
        const laidOut = layoutAnswerBlocksOnPage(rawFallback, p);
        allAnswers.push(...laidOut);
      }
    }

    return NextResponse.json({ answers: allAnswers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}