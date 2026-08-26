'use client';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  FileText,
  CheckCircle2,
  BrainCircuit,
  Zap,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FDFDFC] text-gray-900 font-sans flex flex-col">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-extrabold flex items-center justify-center rounded-xl text-xl shadow-md shadow-orange-500/20">
              V
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-gray-900">
              Veda<span className="text-orange-500">AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <a href="#features" className="hover:text-orange-500 transition">Features</a>
            <a href="#how-it-works" className="hover:text-orange-500 transition">How It Works</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/upload"
              className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm px-6 py-3 rounded-full shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Sparkles size={16} className="animate-pulse" />
              <span>Start Assessment</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-24 overflow-hidden bg-gradient-to-b from-orange-50/50 via-transparent to-transparent">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-orange-400/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-orange-100/80 border border-orange-200 text-orange-800 text-xs font-extrabold px-4 py-2 rounded-full mb-8 shadow-xs">
            <Sparkles size={14} className="text-orange-600" />
            <span>AI-Powered Teacher Assessment Toolkit</span>
            <ChevronRight size={14} className="text-orange-500" />
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 max-w-4xl mx-auto leading-[1.12]">
            Grade Exams 10x Faster with{' '}
            <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text text-transparent">
              Precision AI Mapping
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Upload question papers and student answer sheets. VedaAI automatically maps questions to handwritten answers with pixel-perfect visual highlights and intelligent grading.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/upload"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-xl shadow-orange-500/30 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <FileText size={20} />
              <span>Upload Exam Paper & Answers</span>
              <ArrowRight size={18} />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold text-base px-7 py-4 rounded-2xl shadow-xs hover:bg-gray-50 hover:border-gray-300 transition"
            >
              <span>See How It Works</span>
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="mt-14 flex flex-wrap justify-center items-center gap-8 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-orange-500" /> 100% Instant Setup
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-orange-500" /> Bounding Box Highlighting
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-orange-500" /> Automated AI Feedback
            </div>
          </div>

          {/* Interactive UI Mockup Showcase */}
          <div className="mt-16 relative max-w-5xl mx-auto">
            <div className="rounded-3xl border border-gray-200/80 bg-white p-3 shadow-2xl shadow-gray-900/10">
              <div className="rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 flex flex-col md:flex-row h-[420px]">
                {/* Left Questions Panel */}
                <div className="w-full md:w-5/12 bg-[#F3F4F6] border-r border-gray-200/80 p-4 text-left flex flex-col gap-3">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200 text-xs font-bold text-gray-700">
                    <span>Extracted Questions</span>
                    <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-[10px]">9 Questions</span>
                  </div>
                  <div className="bg-white border-2 border-orange-500 p-3 rounded-xl shadow-xs flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="w-6 h-6 rounded-full bg-orange-500 text-white font-bold text-xs flex items-center justify-center">1</span>
                      <span className="text-[11px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">2/2 Marks</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-800 mt-1">What is a variable in JavaScript?</p>
                  </div>
                  <div className="bg-white border border-gray-200 p-3 rounded-xl opacity-80 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="w-6 h-6 rounded-full bg-gray-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                      <span className="text-[11px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">2/2 Marks</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-700 mt-1">What is the difference between let and const?</p>
                  </div>
                  <div className="bg-white border border-gray-200 p-3 rounded-xl opacity-60 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="w-6 h-6 rounded-full bg-gray-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                      <span className="text-[11px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">2/2 Marks</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-700 mt-1">Explain what an API is with an example.</p>
                  </div>
                </div>

                {/* Right Answer Viewer Panel */}
                <div className="w-full md:w-7/12 bg-gray-800 p-6 flex flex-col items-center justify-center relative">
                  <div className="w-full max-w-sm bg-white rounded-xl p-4 shadow-xl relative border border-gray-200 text-left">
                    <h4 className="text-center font-extrabold text-xs text-gray-800 pb-2 border-b border-gray-100 mb-3">STUDENT ANSWER SHEET</h4>
                    
                    {/* Highlight Box Overlay */}
                    <div className="border-[3px] border-green-500 bg-green-500/10 rounded-xl p-2.5 relative ring-2 ring-white shadow-lg">
                      <div className="absolute -top-3 left-2 bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-t-md">
                        Q1 Answer
                      </div>
                      <p className="text-[11px] font-medium text-gray-900 leading-tight">
                        1. A variable is a named container used to store data in a program. In JavaScript, variables can be declared using let, const, or var.
                      </p>
                    </div>

                    <p className="text-[11px] text-gray-400 mt-3">2. The main difference between let and const is that let can be reassigned...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-extrabold text-orange-600 uppercase tracking-widest">Core Capabilities</h2>
            <p className="mt-2 text-3xl md:text-4xl font-extrabold text-gray-900">
              Designed specifically for modern educators
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-gray-50/80 border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BrainCircuit size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Intelligent Question Extraction</h3>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                Automatically scans question papers, identifies main questions, subparts (a, b, c), and printed maximum marks.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gray-50/80 border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Layers size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Visual Bounding Box Mapping</h3>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                Click any question to instantly highlight its exact answer on the student's answer sheet with crisp bounding box overlays.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gray-50/80 border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Automated AI Evaluation</h3>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                Generates instant scores out of maximum marks along with constructive feedback for each student response.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 bg-gray-50/50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-extrabold text-orange-600 uppercase tracking-widest">Simple 3-Step Process</h2>
            <p className="mt-2 text-3xl md:text-4xl font-extrabold text-gray-900">
              How VedaAI transforms grading
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-xs relative">
              <div className="w-9 h-9 rounded-full bg-orange-500 text-white font-extrabold flex items-center justify-center text-sm mb-4">
                1
              </div>
              <h4 className="text-lg font-bold text-gray-900">Upload Files</h4>
              <p className="mt-2 text-sm text-gray-600">
                Upload your Question Paper (PDF or Image) and the Student Answer Sheet.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-xs relative">
              <div className="w-9 h-9 rounded-full bg-orange-500 text-white font-extrabold flex items-center justify-center text-sm mb-4">
                2
              </div>
              <h4 className="text-lg font-bold text-gray-900">AI Extraction & Mapping</h4>
              <p className="mt-2 text-sm text-gray-600">
                VedaAI extracts questions, parses answers, and maps bounding boxes in seconds.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-xs relative">
              <div className="w-9 h-9 rounded-full bg-orange-500 text-white font-extrabold flex items-center justify-center text-sm mb-4">
                3
              </div>
              <h4 className="text-lg font-bold text-gray-900">Review & Grade</h4>
              <p className="mt-2 text-sm text-gray-600">
                Interact with the split viewer to inspect highlighted answers and AI scores.
              </p>
            </div>
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-base px-8 py-4 rounded-full shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 transition"
            >
              <span>Get Started Now</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-white border-t border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-orange-500 text-white font-bold flex items-center justify-center rounded-lg text-sm">
              V
            </div>
            <span className="font-extrabold text-gray-900">VedaAI Assessment</span>
          </div>
          <p>© {new Date().getFullYear()} VedaAI. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/upload" className="hover:text-orange-500 font-semibold transition">Start Upload</Link>
            <a href="#features" className="hover:text-orange-500 transition">Features</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
