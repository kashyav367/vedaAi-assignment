'use client';
import { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import HighlightOverlay from './HighlightOverlay';

interface Answer {
  questionNumber: string;
  page: number;
  bbox: { x: number; y: number; width: number; height: number };
  text: string;
}

interface Props {
  images: string[]; // base64 png strings (no prefix)
  answers: Answer[];
  selectedQ: string | null;
}

function normalizeKey(str: string): string {
  if (!str) return '';
  return str
    .toString()
    .toLowerCase()
    .replace(/^q(?:uestion)?\s*/i, '')
    .replace(/[^a-z0-9]/g, '');
}

function matchesQuestion(aNum: string, selectedKey: string): boolean {
  const k1 = normalizeKey(aNum);
  const k2 = normalizeKey(selectedKey);
  if (!k1 || !k2) return false;
  return k1 === k2;
}

export default function AnswerViewer({ images, answers, selectedQ }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const matchedAnswers = answers.filter((a) => matchesQuestion(a.questionNumber, selectedQ || ''));

  useEffect(() => {
    if (matchedAnswers.length > 0) {
      setCurrentPage(matchedAnswers[0].page);
    }
  }, [selectedQ]);

  // Smooth scroll to center the highlighted box when selectedQ changes
  useEffect(() => {
    if (overlayRef.current && scrollContainerRef.current) {
      const timer = setTimeout(() => {
        overlayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedQ, currentPage]);

  const pageAnswers = matchedAnswers.filter((a) => a.page === currentPage);

  if (images.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-400">No answer sheet loaded</div>;
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#27272A] text-white text-xs flex-shrink-0">
        <span className="font-semibold text-gray-200">Answer Sheet</span>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-gray-800/80 px-2.5 py-1 rounded-md text-gray-300">
            <button onClick={() => setZoom((z) => Math.max(50, z - 10))} className="p-0.5 hover:text-white transition">
              <Minus size={13} />
            </button>
            <span className="font-medium text-[11px]">{zoom}%</span>
            <button onClick={() => setZoom((z) => Math.min(200, z + 10))} className="p-0.5 hover:text-white transition">
              <Plus size={13} />
            </button>
          </div>
          <div className="flex items-center gap-2 bg-gray-800/80 px-2 py-1 rounded-md text-gray-300">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-0.5 hover:text-white disabled:opacity-30 transition"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-medium text-[11px]">
              Page {currentPage} of {images.length}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(images.length, p + 1))}
              disabled={currentPage === images.length}
              className="p-0.5 hover:text-white disabled:opacity-30 transition"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Image Container */}
      <div ref={scrollContainerRef} className="flex-1 overflow-auto flex justify-center p-6 bg-[#E5E7EB]">
        <div className="relative inline-block shadow-2xl rounded-xl bg-white h-fit" style={{ width: `${zoom}%`, maxWidth: '900px' }}>
          <img
            src={`data:image/png;base64,${images[currentPage - 1]}`}
            alt={`Page ${currentPage}`}
            className="w-full rounded-xl"
          />
          {pageAnswers.map((a, i) => (
            <HighlightOverlay key={i} ref={overlayRef} bbox={a.bbox} label={a.questionNumber} />
          ))}
        </div>
      </div>
    </div>
  );
}