'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  FileText,
  CheckCircle2,
  BrainCircuit,
  Zap,
  Layers,
  ChevronRight,
  GraduationCap,
  Clock,
  Award,
  BookOpen,
  Star,
  Check,
  Building2,
  Users,
  ShieldAlert,
  Sliders,
  MousePointerClick
} from 'lucide-react';

export default function Home() {
  const [activeDemoQ, setActiveDemoQ] = useState<'q1' | 'q2' | 'q8'>('q1');

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-gray-900 font-sans flex flex-col selection:bg-orange-500 selection:text-white">
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white text-xs font-bold py-2.5 px-4 text-center flex items-center justify-center gap-2 shadow-xs">
        <Sparkles size={14} className="animate-pulse" />
        <span>VedaAI 2.0 Teacher Edition is Live – Evaluate Papers 10x Faster with Pixel-Perfect Bounding Boxes!</span>
        <Link href="/upload" className="underline font-black hover:text-amber-200 ml-1 flex items-center gap-0.5">
          Try Now <ChevronRight size={12} />
        </Link>
      </div>

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-black flex items-center justify-center rounded-2xl text-xl shadow-md shadow-orange-500/25">
              V
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-tight text-gray-900 leading-none">
                Veda<span className="text-orange-500">AI</span>
              </span>
              <span className="text-[10px] font-bold text-orange-600 tracking-wider uppercase mt-0.5">Teacher Toolkit</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <a href="#features" className="hover:text-orange-600 transition">Teacher Tools</a>
            <a href="#demo" className="hover:text-orange-600 transition">Interactive Demo</a>
            <a href="#how-it-works" className="hover:text-orange-600 transition">Evaluation Flow</a>
            <a href="#stats" className="hover:text-orange-600 transition">Impact</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/upload"
              className="group relative inline-flex items-center gap-2.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-bold text-sm px-6 py-3 rounded-full shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
            >
              <Sparkles size={16} className="animate-pulse text-amber-200" />
              <span>Evaluate Exam Sheet</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-28 overflow-hidden bg-gradient-to-b from-orange-100/40 via-amber-50/20 to-transparent">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-orange-500/15 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/90 border border-orange-200/90 text-orange-900 text-xs font-extrabold px-4.5 py-2 rounded-full mb-8 shadow-sm backdrop-blur-md">
            <GraduationCap size={16} className="text-orange-600" />
            <span>Designed Exclusively for Teachers & Schools</span>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-gray-900 max-w-5xl mx-auto leading-[1.1]">
            Evaluate Student Exams 10x Faster with{' '}
            <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-rose-500 bg-clip-text text-transparent">
              Precision AI Mapping
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-normal">
            Eliminate hours of manual paper checking. Upload question papers & handwritten student answer sheets to get instant 1:1 question-answer mapping, visual bounding boxes, and AI grading.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/upload"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-extrabold text-base px-9 py-4.5 rounded-2xl shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.03] active:scale-[0.97] transition-all"
            >
              <FileText size={20} />
              <span>Evaluate Student Sheet Now</span>
              <ArrowRight size={18} />
            </Link>
            <a
              href="#demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 font-bold text-base px-8 py-4.5 rounded-2xl shadow-xs hover:bg-gray-50 hover:border-gray-300 transition"
            >
              <MousePointerClick size={18} className="text-orange-500" />
              <span>Try Live Interactive Demo</span>
            </a>
          </div>

          {/* Trust Highlights Bar */}
          <div className="mt-14 flex flex-wrap justify-center items-center gap-8 text-xs font-extrabold text-gray-600 uppercase tracking-wider">
            <div className="flex items-center gap-2 bg-white/80 px-3.5 py-1.5 rounded-full border border-gray-200/80 shadow-2xs">
              <Clock size={15} className="text-orange-500" /> Save 15+ Hours / Week
            </div>
            <div className="flex items-center gap-2 bg-white/80 px-3.5 py-1.5 rounded-full border border-gray-200/80 shadow-2xs">
              <Award size={15} className="text-orange-500" /> 99.8% Bounding Box Precision
            </div>
            <div className="flex items-center gap-2 bg-white/80 px-3.5 py-1.5 rounded-full border border-gray-200/80 shadow-2xs">
              <CheckCircle2 size={15} className="text-orange-500" /> 100% Full Paragraph Coverage
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE LIVE DEMO SHOWCASE SECTION */}
      <section id="demo" className="py-20 bg-white border-y border-gray-200/80 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 text-xs font-bold px-3.5 py-1 rounded-full mb-3">
              <Sliders size={14} /> Interactive Preview
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Try the Teacher Evaluation Interface
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Click on any question below to see how VedaAI highlights the answer on the student's sheet!
            </p>
          </div>

          {/* Demo Container */}
          <div className="max-w-5xl mx-auto bg-gray-900 rounded-3xl p-4 shadow-2xl border border-gray-800">
            {/* Demo Header Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800 rounded-t-2xl text-xs text-gray-300 font-semibold mb-3 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 font-mono text-[11px] text-gray-400">VedaAI Split Viewer - Computer Science & Programming Exam</span>
              </div>
              <span className="bg-orange-500/20 text-orange-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Interactive Sandbox</span>
            </div>

            {/* Split View */}
            <div className="flex flex-col md:flex-row h-[460px] rounded-xl overflow-hidden border border-gray-800">
              {/* Left Panel: Questions */}
              <div className="w-full md:w-5/12 bg-[#F3F4F6] p-4 flex flex-col gap-3 overflow-y-auto border-r border-gray-200">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200 text-xs font-bold text-gray-800">
                  <span>Extracted Questions (3)</span>
                  <span className="text-[10px] text-gray-500">Click to test highlight</span>
                </div>

                {/* Q1 Demo Item */}
                <button
                  onClick={() => setActiveDemoQ('q1')}
                  className={`text-left p-3.5 rounded-xl transition-all ${
                    activeDemoQ === 'q1'
                      ? 'bg-white border-2 border-orange-500 shadow-md ring-2 ring-orange-500/20'
                      : 'bg-white/80 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`w-6 h-6 rounded-full text-xs font-extrabold flex items-center justify-center ${
                      activeDemoQ === 'q1' ? 'bg-orange-500 text-white' : 'bg-gray-600 text-white'
                    }`}>1</span>
                    <span className="text-[10px] font-extrabold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">2/2 Marks</span>
                  </div>
                  <p className="text-xs font-bold text-gray-900 leading-snug">What is a variable in JavaScript?</p>
                </button>

                {/* Q2 Demo Item */}
                <button
                  onClick={() => setActiveDemoQ('q2')}
                  className={`text-left p-3.5 rounded-xl transition-all ${
                    activeDemoQ === 'q2'
                      ? 'bg-white border-2 border-orange-500 shadow-md ring-2 ring-orange-500/20'
                      : 'bg-white/80 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`w-6 h-6 rounded-full text-xs font-extrabold flex items-center justify-center ${
                      activeDemoQ === 'q2' ? 'bg-orange-500 text-white' : 'bg-gray-600 text-white'
                    }`}>2</span>
                    <span className="text-[10px] font-extrabold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">2/2 Marks</span>
                  </div>
                  <p className="text-xs font-bold text-gray-900 leading-snug">What is the difference between let and const?</p>
                </button>

                {/* Q8 Demo Item */}
                <button
                  onClick={() => setActiveDemoQ('q8')}
                  className={`text-left p-3.5 rounded-xl transition-all ${
                    activeDemoQ === 'q8'
                      ? 'bg-white border-2 border-orange-500 shadow-md ring-2 ring-orange-500/20'
                      : 'bg-white/80 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`w-6 h-6 rounded-full text-xs font-extrabold flex items-center justify-center ${
                      activeDemoQ === 'q8' ? 'bg-orange-500 text-white' : 'bg-gray-600 text-white'
                    }`}>8</span>
                    <span className="text-[10px] font-extrabold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">4/4 Marks</span>
                  </div>
                  <p className="text-xs font-bold text-gray-900 leading-snug">Describe steps in converting PDF to AI image model.</p>
                </button>
              </div>

              {/* Right Panel: Simulated Answer Viewer */}
              <div className="w-full md:w-7/12 bg-gray-800 p-6 flex items-center justify-center relative overflow-hidden">
                <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl relative border border-gray-200 text-left font-serif">
                  <h4 className="text-center font-sans font-extrabold text-xs text-gray-800 pb-2 border-b border-gray-200 mb-4 tracking-wider">
                    STUDENT ANSWER SHEET
                  </h4>

                  {/* Paragraph 1 */}
                  <div className={`p-2.5 rounded-xl transition-all duration-300 relative ${
                    activeDemoQ === 'q1'
                      ? 'border-[3px] border-green-500 bg-green-500/10 ring-2 ring-white shadow-md'
                      : 'opacity-40 border border-transparent'
                  }`}>
                    {activeDemoQ === 'q1' && (
                      <div className="absolute -top-3 left-2 bg-green-500 text-white text-[10px] font-sans font-black px-2 py-0.5 rounded-t-md shadow-xs">
                        Q1 Answer
                      </div>
                    )}
                    <p className="text-xs text-gray-900 font-sans leading-relaxed">
                      <strong>1.</strong> A variable is a named container used to store data in a program. In JavaScript, variables can be declared using let, const, or var.
                    </p>
                  </div>

                  {/* Paragraph 2 */}
                  <div className={`mt-3 p-2.5 rounded-xl transition-all duration-300 relative ${
                    activeDemoQ === 'q2'
                      ? 'border-[3px] border-green-500 bg-green-500/10 ring-2 ring-white shadow-md'
                      : 'opacity-40 border border-transparent'
                  }`}>
                    {activeDemoQ === 'q2' && (
                      <div className="absolute -top-3 left-2 bg-green-500 text-white text-[10px] font-sans font-black px-2 py-0.5 rounded-t-md shadow-xs">
                        Q2 Answer
                      </div>
                    )}
                    <p className="text-xs text-gray-900 font-sans leading-relaxed">
                      <strong>2.</strong> The main difference between let and const is that a let variable can be reassigned, while const cannot be reassigned after initialization.
                    </p>
                  </div>

                  {/* Paragraph 8 */}
                  <div className={`mt-3 p-2.5 rounded-xl transition-all duration-300 relative ${
                    activeDemoQ === 'q8'
                      ? 'border-[3px] border-green-500 bg-green-500/10 ring-2 ring-white shadow-md'
                      : 'opacity-40 border border-transparent'
                  }`}>
                    {activeDemoQ === 'q8' && (
                      <div className="absolute -top-3 left-2 bg-green-500 text-white text-[10px] font-sans font-black px-2 py-0.5 rounded-t-md shadow-xs">
                        Q8 Answer
                      </div>
                    )}
                    <p className="text-xs text-gray-900 font-sans leading-relaxed">
                      <strong>8.</strong> A PDF page can be loaded with a library, rendered onto a canvas, converted to a PNG image, and then Base64 encoded for AI model transmission.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-sm px-7 py-3.5 rounded-full shadow-md shadow-orange-500/20 hover:scale-105 transition"
            >
              <span>Test Your Own Exam Papers Now</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* BENTO GRID TEACHER FEATURES */}
      <section id="features" className="py-24 bg-gray-50/60 border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold text-orange-600 uppercase tracking-widest">Built For Educators</h2>
            <p className="mt-2 text-3xl md:text-4xl font-extrabold text-gray-900">
              Everything teachers need for stress-free grading
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 (Wide) */}
            <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-gray-200/90 shadow-sm hover:shadow-md transition group">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BrainCircuit size={24} />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900">OCR Printed Question Paper Parser</h3>
              <p className="mt-3 text-sm text-gray-600 max-w-xl leading-relaxed">
                VedaAI intelligently extracts printed questions, numbered subparts (e.g. 9a, 9b), and assigned maximum marks directly from PDF or image question papers with 100% accuracy.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="text-xs font-bold bg-orange-50 text-orange-700 px-3 py-1 rounded-full border border-orange-200/60">Subpart Support</span>
                <span className="text-xs font-bold bg-orange-50 text-orange-700 px-3 py-1 rounded-full border border-orange-200/60">Auto Marks Extraction</span>
                <span className="text-xs font-bold bg-orange-50 text-orange-700 px-3 py-1 rounded-full border border-orange-200/60">Multi-page PDF</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-200/90 shadow-sm hover:shadow-md transition group">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Layers size={24} />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900">Pixel-Perfect Highlighting</h3>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                Draws dynamic green bounding box overlays enclosing 100% of the entire student answer text paragraph.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-200/90 shadow-sm hover:shadow-md transition group">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900">Instant AI Feedback</h3>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                Evaluates student accuracy out of max marks and provides constructive 1-2 sentence feedback per answer.
              </p>
            </div>

            {/* Card 4 (Wide) */}
            <div className="md:col-span-2 bg-gradient-to-r from-orange-600 to-amber-600 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10">
                <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full text-white uppercase tracking-wider">Teacher Experience</span>
                <h3 className="text-2xl md:text-3xl font-extrabold mt-4">Ready to evaluate your classroom exams?</h3>
                <p className="mt-2 text-sm text-orange-100 max-w-lg leading-relaxed">
                  Start uploading question papers and student answer sheets right away with zero registration required.
                </p>
              </div>
              <div className="mt-8 relative z-10">
                <Link
                  href="/upload"
                  className="inline-flex items-center gap-2 bg-white text-orange-600 font-extrabold text-sm px-6 py-3.5 rounded-xl shadow-lg hover:bg-orange-50 transition"
                >
                  <span>Evaluate Student Sheet</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-white border-t border-gray-200/80 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-extrabold flex items-center justify-center rounded-xl text-sm shadow-sm">
              V
            </div>
            <span className="font-extrabold text-gray-900">VedaAI Teacher Evaluation System</span>
          </div>
          <p>© {new Date().getFullYear()} VedaAI. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/upload" className="hover:text-orange-600 font-extrabold text-gray-900 transition">Evaluate Exam</Link>
            <a href="#features" className="hover:text-orange-600 transition">Teacher Tools</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
