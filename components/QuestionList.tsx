'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Question {
  number: string;
  subpart?: string | null;
  text: string;
  maxMarks?: number | null;
}

interface Answer {
  questionNumber: string;
  page: number;
  bbox: { x: number; y: number; width: number; height: number };
  text: string;
  score?: number;
  feedback?: string;
}

interface Props {
  questions: Question[];
  answers: Answer[];
  selectedQ: string | null;
  onSelect: (qKey: string) => void;
}

function qKey(number: string, subpart?: string | null) {
  return subpart ? `${number}${subpart}` : number;
}

export default function QuestionList({ questions, answers, selectedQ, onSelect }: Props) {
  const [expandAll, setExpandAll] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[#F3F4F6]">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200/80 bg-white/60 backdrop-blur-sm flex-shrink-0">
        <h3 className="font-bold text-sm text-gray-900">
          Extracted Questions <span className="text-gray-400 font-normal">(from question paper)</span>
        </h3>
        <button
          onClick={() => setExpandAll((v) => !v)}
          className="text-xs font-semibold text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-2xs hover:bg-gray-50 transition"
        >
          {expandAll ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      {/* Question List */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {questions.map((q, idx) => {
          const key = qKey(q.number, q.subpart);
          const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
          const answer = answers.find(
            (a) => (a.questionNumber || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '') === cleanKey
          );
          const isSelected = selectedQ === key;
          const isOpen = isSelected || expandAll;
          const answered = !!answer;

          return (
            <div
              key={key + idx}
              onClick={() => onSelect(key)}
              className={`rounded-2xl p-4 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-2 border-orange-500 bg-white shadow-md'
                  : 'border border-gray-100 bg-white hover:border-gray-300 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected ? 'bg-orange-500 text-white' : 'bg-[#4B5563] text-white'
                    }`}
                  >
                    {q.number}
                  </div>
                  <div className="flex-1">
                    {q.subpart && <span className="text-xs font-bold text-gray-500 mr-1">{q.subpart}.</span>}
                    <p className="text-sm font-medium text-gray-800 leading-snug">
                      {q.text.replace(/\[Y:[\d\.]+\]\s*/g, '')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                  {answered ? (
                    <ScoreBadge score={answer?.score} max={q.maxMarks} />
                  ) : (
                    <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                      Not answered
                    </span>
                  )}
                  <div className="text-gray-400">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
              </div>

              {isOpen && (
                <div className="mt-3.5 bg-[#F9FAFB] border border-gray-100 rounded-xl p-3.5 text-xs">
                  {answered ? (
                    <>
                      <p className="font-bold text-gray-900 mb-1">AI Feedback</p>
                      <p className="text-gray-600 leading-relaxed">
                        {answer?.feedback || 'Evaluating answer performance...'}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-500 font-medium">This question was not answered on the student sheet.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScoreBadge({ score, max }: { score?: number | null; max?: number | null }) {
  const maxMarks = max || 5;
  const actualScore = score !== undefined && score !== null ? score : maxMarks;
  const ratio = actualScore / maxMarks;
  let badgeStyle = 'bg-[#DCFCE7] text-[#16A34A]'; // Green for high
  if (ratio === 0) {
    badgeStyle = 'bg-[#FEE2E2] text-[#DC2626]'; // Red for 0
  } else if (ratio < 0.7) {
    badgeStyle = 'bg-[#FFEDD5] text-[#C2410C]'; // Orange for partial
  }

  return <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${badgeStyle}`}>{actualScore}/{maxMarks}</span>;
}