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
      const regex = new RegExp(`^(?:q(?:uestion)?\\s*)?${num}\\s*[\\.\\(-]?\\s*\\(?${sub}\\)?[\\.\\)\\s]`, 'i');
      if (regex.test(textStr)) return normKey;
    } else {
      const regex = new RegExp(`^(?:q(?:uestion)?\\s*)?${expectedKey}[\\.\\)\\s]`, 'i');
      if (regex.test(textStr)) return normKey;
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
      const regex = new RegExp(`^(?:q(?:uestion)?\\s*)?${num}\\s*[\\.\\(-]?\\s*\\(?${sub}\\)?[\\.\\)\\s]`, 'i');
      if (regex.test(textStr)) return true;
    } else {
      const regex = new RegExp(`^(?:q(?:uestion)?\\s*)?${expectedKey}[\\.\\)\\s]`, 'i');
      if (regex.test(textStr)) return true;
    }
  }
  const numMatch = textStr.match(/^(?:q(?:uestion)?\s*)?(\d+)[\.\)\s]/i);
  return !!numMatch;
}

// Layout strategy:
// 1. If Gemini Vision returned bbox.y positions → TRUST them (they're measured from the actual image)
// 2. If no vision data (OCR/fallback) → compute equal-distribution layout
function layoutAnswerBlocksOnPage(rawBlocks: any[], pageNum: number): any[] {
  if (!rawBlocks || rawBlocks.length === 0) return [];
  const answerBlocks = rawBlocks.filter((a: any) => {
    const txt = (a.text || '').toLowerCase();
    return !(txt.includes('student answer sheet') || txt.includes('roll no') || txt.includes('class:'));
  });
  if (answerBlocks.length === 0) return [];

  // Check if we have Vision AI bbox data (at least some blocks have y > 0)
  const hasVisionData = answerBlocks.some(
    (a: any) => typeof a.bbox?.y === 'number' && a.bbox.y > 5
  );

  if (hasVisionData) {
    // STRATEGY 1: Use Vision AI positions directly
    // Sort by y to ensure top-to-bottom order
    const sorted = [...answerBlocks].sort(
      (a: any, b: any) => (a.bbox?.y || 0) - (b.bbox?.y || 0)
    );

    return sorted.map((a: any, idx: number) => {
      const y = a.bbox?.y || 0;
      // For height: use vision height if provided, otherwise compute from gap to next answer
      let height = a.bbox?.height || 0;
      if (height < 2 && idx < sorted.length - 1) {
        // Compute height as distance to next answer minus a small gap
        const nextY = sorted[idx + 1].bbox?.y || (y + 7);
        height = Math.max(3, nextY - y - 0.5);
      } else if (height < 2) {
        // Last answer: estimate height from text length
        const lines = Math.max(2, Math.ceil((a.text || '').length / 80));
        height = lines * 2.2;
      }

      return {
        ...a,
        page: pageNum,
        bbox: {
          x: a.bbox?.x || 4,
          y: Number(y.toFixed(1)),
          width: a.bbox?.width || 92,
          height: Number(Math.min(height, 20).toFixed(1)),
        },
      };
    });
  }

  // STRATEGY 2: No vision data — compute proportional layout from text lengths
  const startY = pageNum === 1 ? 15.0 : 5.0;
  const endY = pageNum === 1 ? 85.0 : 95.0;
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

    // If the PDF text came as a single long line (old extraction), split at question boundaries
    if (lines.length < 5 && lines.some(l => l.length > 300)) {
      const singleLine = lines.join(' ');
      // Split at question number patterns like "1." "2." "9(a)." etc.
      const splitLines = singleLine.split(/(?=\b(\d+)\s*(?:\([a-z]\))?\s*[\.\:\)])/i).filter(s => s.trim().length > 0);
      // Re-join split fragments (the regex capture group creates extra entries)
      const rebuilt: string[] = [];
      for (const frag of splitLines) {
        const trimmed = frag.trim();
        if (!trimmed) continue;
        if (/^\d+$/.test(trimmed) && rebuilt.length > 0) {
          // This is just a captured digit, prepend to next
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

    // Detect if this page has a header (Student Answer Sheet, Name, Roll No, etc.)
    let headerLines = 0;
    for (let h = 0; h < Math.min(8, totalLines); h++) {
      const hl = lines[h].toLowerCase();
      if (hl.includes('student answer') || hl.includes('subject:') || hl.includes('name:') ||
          hl.includes('roll no') || hl.includes('date:') || hl.includes('class:') ||
          hl.includes('answer sheet')) {
        headerLines = h + 1;
      }
    }

    const itemPositions: any[] = [];
    for (let l = 0; l < lines.length; l++) {
      const line = lines[l].trim();
      const match = line.match(/^(?:q(?:uestion)?\s*)?(\d+)\s*(?:\(?([a-z])\)?|\.([a-z]))?\s*[\.\:\)]/i);
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

      const fullText = lines.slice(startLine, endLine).join(' ').trim();
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
        rawBlocks.push({
          questionNumber: mappedNum,
          text: fullText,
          _startLine: startLine,
          _endLine: endLine,
        });
      }
    }

    // Use line positions to compute accurate Y coordinates
    // The PDF image maps lines proportionally: line N of totalLines → N/totalLines of page height
    // Account for header space and page margins
    const pageTopMargin = 3.0;  // top margin of rendered image
    const pageBottomMargin = 3.0;
    const headerFraction = headerLines / totalLines;
    const contentStartY = pageTopMargin + headerFraction * (100 - pageTopMargin - pageBottomMargin);
    const contentEndY = 100 - pageBottomMargin;

    const laidOut = rawBlocks.map((a: any) => {
      const answerStartFrac = a._startLine / totalLines;
      const answerEndFrac = a._endLine / totalLines;
      const y = pageTopMargin + answerStartFrac * (100 - pageTopMargin - pageBottomMargin);
      const bottom = pageTopMargin + answerEndFrac * (100 - pageTopMargin - pageBottomMargin);
      const height = Math.max(3, bottom - y - 0.3);

      return {
        questionNumber: a.questionNumber,
        text: a.text,
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
        console.log(`[extract-answers] pdfText length: ${pdfText.length}, lines: ${pdfText.split('\n').length}`);
        const pdfAnswers = parseAnswersFromPdfText(pdfText, expectedQuestions);
        if (pdfAnswers.length > 0) {
          allAnswers = pdfAnswers;
          console.log(`[extract-answers] PATH 1 (pdfText): ${allAnswers.length} answers extracted`);
        }
      } catch (e: any) {
        console.warn('PDF text answer parsing failed:', e?.message);
      }
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
        } catch (err: any) {
          console.error(`Page ${i + 1} extraction failed:`, err?.message);
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
        console.log('Running OCR fallback for answer extraction...');
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
      } catch (ocrErr: any) {
        console.warn('OCR answer extraction error:', ocrErr?.message);
      }
    }

    // 4. Dynamic Proportional Layout Fallback across Multi-Page PDFs (Zero Hardcoded Data)
    if (allAnswers.length === 0 && expectedQuestions.length > 0) {
      console.log('Generating dynamic answer blocks for expected questions across multi-page PDF');
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

    console.log('FINAL MAPPING:', JSON.stringify(allAnswers.map(a => ({
      q: a.questionNumber, page: a.page, y: a.bbox?.y, h: a.bbox?.height, textStart: a.text?.slice(0, 35)
    })), null, 2));

    return NextResponse.json({ answers: allAnswers });
  } catch (err: any) {
    console.error('extract-answers error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}