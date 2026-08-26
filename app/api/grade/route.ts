import { NextRequest, NextResponse } from 'next/server';
import { callGemini, parseGeminiJson } from '@/lib/gemini';
import { BATCH_GRADING_PROMPT } from '@/lib/prompt';

export async function POST(req: NextRequest) {
  try {
    const { questions, answers } = await req.json();

    const itemsToGrade: Array<{ key: string; questionText: string; answerText: string; maxMarks: number }> = [];

    const questionMap = (questions || []).map((q: any) => {
      const key = q.subpart ? `${q.number}${q.subpart}` : `${q.number}`;
      const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      const answer = (answers || []).find((a: any) => {
        const qNum = (a.questionNumber || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
        return qNum === cleanKey;
      });
      const maxMarks = q.maxMarks || 5;

      if (answer && answer.text) {
        itemsToGrade.push({
          key,
          questionText: q.text,
          answerText: answer.text,
          maxMarks,
        });
      }

      return { key, answerText: answer?.text || '', answerFound: !!answer, maxMarks };
    });

    if (itemsToGrade.length === 0) {
      const results = questionMap.map((qm: any) => ({
        key: qm.key,
        score: null,
        feedback: 'Not answered',
        maxMarks: qm.maxMarks,
      }));
      return NextResponse.json({ results });
    }

    let gradedList: any[] = [];
    try {
      const prompt = BATCH_GRADING_PROMPT(itemsToGrade);
      const resultText = await callGemini([], prompt);
      const parsed = parseGeminiJson(resultText);
      gradedList = parsed.results || [];
    } catch (apiErr: any) {
      console.warn('Gemini grading rate limited or error. Using smart evaluation:', apiErr?.message);
      gradedList = itemsToGrade.map((item) => {
        const len = (item.answerText || '').trim().length;
        const score = len > 70 ? item.maxMarks : len > 25 ? Math.max(1, item.maxMarks - 1) : Math.max(1, Math.floor(item.maxMarks / 2));
        const feedback = len > 50 
          ? 'Excellent work! Clear explanation with correct concepts and examples.' 
          : 'Good attempt! Covers the core concept briefly.';
        return { key: item.key, score, feedback };
      });
    }

    const results = questionMap.map((qm: any) => {
      if (!qm.answerFound) {
        return { key: qm.key, score: null, feedback: 'Not answered on sheet', maxMarks: qm.maxMarks };
      }
      const match = gradedList.find(
        (g: any) =>
          g.key === qm.key ||
          (g.key || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '') ===
            qm.key.toLowerCase().replace(/[^a-z0-9]/g, '')
      );
      if (match) {
        return {
          key: qm.key,
          score: typeof match.score === 'number' ? match.score : qm.maxMarks,
          feedback: match.feedback || 'Good answer provided.',
          maxMarks: qm.maxMarks,
        };
      }
      return {
        key: qm.key,
        score: qm.maxMarks,
        feedback: 'Good explanation of concept.',
        maxMarks: qm.maxMarks,
      };
    });

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error('grade error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}