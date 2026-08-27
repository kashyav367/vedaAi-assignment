'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import QuestionList from '@/components/QuestionList';
import AnswerViewer from '@/components/AnswerViewer';
import {
  ArrowLeft,
  ClipboardList,
  HelpCircle,
  Bell,
  Sparkles,
  ChevronDown,
  LayoutGrid,
  Presentation,
  FileText,
  PieChart,
  Settings,
  ChevronsRight,
} from 'lucide-react';

interface MappingData {
  questions: any[];
  answers: any[];
  answerImages: string[];
}

export default function MappingPage() {
  const [data, setData] = useState<MappingData | null>(null);
  const [selectedQ, setSelectedQ] = useState<string | null>(null);
  const [grading, setGrading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const raw = sessionStorage.getItem('mappingData');
    if (!raw) {
      router.push('/upload');
      return;
    }
    const parsed = JSON.parse(raw);
    setData(parsed);
    // Set default selected question
    if (parsed.questions && parsed.questions.length > 0) {
      const q = parsed.questions[0];
      setSelectedQ(q.subpart ? `${q.number}${q.subpart}` : q.number);
    }
    runGrading(parsed);
  }, [router]);

  const runGrading = async (parsed: MappingData) => {
    setGrading(true);
    try {
      const res = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: parsed.questions, answers: parsed.answers }),
      });

      if (!res.ok) {
        return;
      }

      const json = await res.json();
      if (json.error) {
        return;
      }

      const results = json.results || [];

      setData((prev) => {
        if (!prev) return prev;
        const updatedAnswers = prev.answers.map((a: any) => {
          const match = results.find(
            (r: any) =>
              r.key === a.questionNumber ||
              (r.key || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '') ===
                (a.questionNumber || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '')
          );
          return match ? { ...a, score: match.score, feedback: match.feedback, maxMarks: match.maxMarks } : a;
        });
        return { ...prev, answers: updatedAnswers };
      });
    } catch (_) {
    } finally {
      setGrading(false);
    }
  };

  if (!data) {
    return <div className="flex items-center justify-center h-screen bg-[#F3F4F6] text-gray-400">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-[#F3F4F6] overflow-hidden">
      {/* LEFT ICON SIDEBAR RAIL */}
      <aside className="w-[64px] bg-white border-r border-gray-200/80 flex flex-col items-center py-4 gap-5 flex-shrink-0 z-20">
        <div className="w-9 h-9 bg-black text-white font-extrabold flex items-center justify-center rounded-xl text-lg shadow-sm">
          V
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition">
          <Sparkles size={18} />
        </div>

        <nav className="flex flex-col gap-4 text-gray-400 mt-2">
          <button className="p-2 hover:text-gray-900 transition">
            <LayoutGrid size={20} />
          </button>
          <button className="p-2 hover:text-gray-900 transition">
            <Presentation size={20} />
          </button>
          <button className="p-2 hover:text-gray-900 transition">
            <FileText size={20} />
          </button>
          <button className="p-2 text-orange-500 font-bold bg-orange-50 rounded-xl">
            <ClipboardList size={20} />
          </button>
          <button className="p-2 hover:text-gray-900 transition">
            <PieChart size={20} />
          </button>
        </nav>

        <div className="mt-auto flex flex-col gap-4 text-gray-400">
          <button className="p-2 hover:text-gray-900 transition">
            <Settings size={20} />
          </button>
          <button className="p-2 hover:text-gray-900 transition">
            <ChevronsRight size={20} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP BAR */}
        <header className="flex items-center justify-between px-6 py-3.5 border-b border-gray-200/80 bg-white flex-shrink-0">
          <div className="flex items-center gap-3 text-gray-700">
            <button onClick={() => router.push('/upload')} className="hover:text-black transition">
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2 font-semibold text-sm">
              <FileText size={16} className="text-gray-500" />
              <span>Exams</span>
            </div>
          </div>
          <div className="flex items-center gap-5 text-gray-500">
            <HelpCircle size={19} className="cursor-pointer hover:text-gray-800" />
            <div className="relative cursor-pointer">
              <Bell size={19} className="hover:text-gray-800" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full" />
            </div>
            <Sparkles size={19} className="cursor-pointer hover:text-orange-500 transition" />
            <div className="flex items-center gap-2 text-gray-900 font-semibold text-xs cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                MR
              </div>
              <span>Madhur Rastogi</span>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
        </header>

        {/* CONTENT SPLIT PANELS */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT: QUESTIONS LIST */}
          <div className="w-[46%] border-r border-gray-200/80 overflow-hidden flex flex-col bg-[#F3F4F6]">
            {grading && (
              <div className="px-4 py-2 bg-orange-500 text-white text-xs font-bold flex items-center gap-2 flex-shrink-0 animate-pulse">
                <Sparkles size={14} /> AI Grading answers live...
              </div>
            )}
            <QuestionList
              questions={data.questions}
              answers={data.answers}
              selectedQ={selectedQ}
              onSelect={setSelectedQ}
            />
          </div>

          {/* RIGHT: ANSWER SHEET VIEWER */}
          <div className="w-[54%] overflow-hidden bg-gray-900">
            <AnswerViewer images={data.answerImages} answers={data.answers} selectedQ={selectedQ} />
          </div>
        </div>
      </div>
    </div>
  );
}