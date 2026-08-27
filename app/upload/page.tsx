'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UploadBox from '@/components/UploadBox';
import { pdfToImages, fileToBase64 } from '@/lib/pdfToImages';
import {
  LayoutGrid,
  Presentation,
  FileText,
  ClipboardList,
  PieChart,
  Settings,
  ArrowLeft,
  HelpCircle,
  Bell,
  Sparkles,
  ArrowRight,
  PanelLeft,
} from 'lucide-react';
import ExtractingScreen from '@/components/ExtractingScreen';

export default function UploadPage() {
  const [questionPaper, setQuestionPaper] = useState<File | null>(null);
  const [answerSheet, setAnswerSheet] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const canStart = questionPaper && answerSheet && !loading;

  const handleStartMapping = async () => {
    if (!questionPaper || !answerSheet) return;
    setLoading(true);
    try {
      const qData =
        questionPaper.type === 'application/pdf'
          ? await pdfToImages(questionPaper)
          : { images: [await fileToBase64(questionPaper)], pdfText: '' };

      const aData =
        answerSheet.type === 'application/pdf'
          ? await pdfToImages(answerSheet)
          : { images: [await fileToBase64(answerSheet)], pdfText: '' };

      const qRes = await fetch('/api/extract-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: qData.images, pdfText: qData.pdfText }),
      });
      const questionsData = await qRes.json();
      if (questionsData.error) {
        throw new Error(questionsData.error);
      }

      const aRes = await fetch('/api/extract-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: aData.images, pdfText: aData.pdfText, questions: questionsData.questions }),
      });
      const answersData = await aRes.json();
      if (answersData.error) {
        throw new Error(answersData.error);
      }

      sessionStorage.setItem(
        'mappingData',
        JSON.stringify({ questions: questionsData.questions, answers: answersData.answers, answerImages: aData.images })
      );
      router.push('/mapping');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Extraction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ExtractingScreen />;
  }

  return (
    <div className="flex h-screen bg-white">
      {/* SIDEBAR */}
      <aside className="w-[280px] border-r border-gray-100 flex flex-col p-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center text-white font-bold">V</div>
            <span className="font-bold text-lg text-gray-900">VedaAI</span>
          </div>
          <PanelLeft size={18} className="text-gray-400" />
        </div>

        <div className="mb-6 bg-black text-white rounded-full px-4 py-2.5 flex items-center gap-2 text-sm font-medium border border-orange-400">
          <Sparkles size={16} /> AI Teacher's Toolkit
        </div>

        <nav className="flex flex-col gap-1 text-sm">
          <SidebarItem icon={<LayoutGrid size={18} />} label="Home" />
          <SidebarItem icon={<Presentation size={18} />} label="My Classroom" />
          <SidebarItem icon={<FileText size={18} />} label="Assignments" />
          <SidebarItem icon={<ClipboardList size={18} />} label="Exams" active />
          <SidebarItem icon={<PieChart size={18} />} label="My Library" />
        </nav>

        <div className="mt-auto">
          <SidebarItem icon={<Settings size={18} />} label="Settings" />
          <div className="mt-3 bg-gray-50 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold">
              DP
            </div>
            <div className="text-xs">
              <p className="font-semibold text-gray-900">Delhi Public School</p>
              <p className="text-gray-400">Bokaro Steel City</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col bg-gray-50">
        {/* TOP BAR */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3 text-gray-600">
            <ArrowLeft size={18} />
            <ClipboardList size={16} />
            <span className="font-medium">Exams</span>
          </div>
          <div className="flex items-center gap-4 text-gray-500">
            <HelpCircle size={20} />
            <div className="relative">
              <Bell size={20} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full" />
            </div>
            <Sparkles size={20} />
            <div className="flex items-center gap-2 text-black font-medium">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                MR
              </div>
              Madhur Rastogi
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <h1 className="text-3xl font-bold mb-2 text-center text-gray-900 whitespace-nowrap">
            Upload{' '}
            <span className="text-orange-500 bg-orange-50 px-2 py-1 rounded">
              Question Paper &amp; Answer Sheets
            </span>
          </h1>
          <p className="text-gray-500 mb-8">Upload both files to get started</p>

          {/* Illustration circle */}
          <div className="w-28 h-28 rounded-full bg-orange-100 flex items-center justify-center mb-8 relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center text-3xl">
              👩‍🏫
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 w-full max-w-3xl mb-8">
            <UploadBox
              label="Question Paper"
              file={questionPaper}
              onFileSelect={setQuestionPaper}
              onRemove={() => setQuestionPaper(null)}
            />
            <UploadBox
              label="Answer Sheet"
              file={answerSheet}
              onFileSelect={setAnswerSheet}
              onRemove={() => setAnswerSheet(null)}
            />
          </div>

          <button
            disabled={!canStart}
            onClick={handleStartMapping}
            className={`px-8 py-3 rounded-full font-semibold flex items-center gap-2 transition ${
              canStart ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? 'Extracting...' : 'Start Mapping'}
            <ArrowRight size={18} />
          </button>
          <p className="text-xs text-gray-400 mt-4 text-center">
            Once both files are uploaded, you'll able to map answers with questions
          </p>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div
      className={`px-3 py-2.5 rounded-lg cursor-pointer flex items-center gap-3 ${
        active ? 'bg-gray-100 text-black font-semibold' : 'text-gray-500 hover:bg-gray-50'
      }`}
    >
      {icon}
      {label}
    </div>
  );
}