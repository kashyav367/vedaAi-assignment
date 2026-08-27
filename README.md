# 🎓 VedaAI - AI-Powered Teacher Assessment & Automated Answer Mapping

An intelligent, state-of-the-art educational evaluation platform built with **Next.js (App Router)**, **Google Gemini AI**, and **PDF.js**. It automates question paper extraction, handwritten/typed student answer sheet mapping, AI-assisted grading, and **pixel-accurate dynamic visual answer highlighting**.

---

## 📸 Screenshots & UI Showcase

<div align="center">
  <p><b>1. Question Paper & Student Answer Sheet Upload</b></p>
  <img src="./screenshots/upload-screen.png" alt="VedaAI Upload Interface" width="850" />
  
  <br/><br/>
  
  <p><b>2. Interactive Split-Screen Assessment & Dynamic Highlighting</b></p>
  <img src="./screenshots/mapping-demo.png" alt="VedaAI Interactive Mapping and Grading" width="850" />
</div>

---

## 📝 Blog & In-Depth Technical Case Study

> ✍️ **Deep-Dive Article / Blog Post:**  
> 🔗 **Read the full engineering story:** `[INSERT YOUR BLOG / MEDIUM / DEV.TO LINK HERE]` *(e.g., https://medium.com/@yourusername/building-vedaai-accurate-pdf-answer-mapping)*

---

## 🌟 Key Features

- **📄 Automatic Question Paper Extraction:** Extracts questions, sub-parts (e.g., `9(a)`, `9(b)`), and maximum marks from uploaded PDF/image exam papers.
- **🎯 100% Dynamic, Zero-Hardcoded Answer Highlighting:** Precise visual bounding box targeting each question's answer on the student sheet, regardless of answer length (1 line or 10+ lines) or layout variations.
- **⚡ Interactive Split-Screen Assessment:** Clicking any question in the left panel smoothly navigates and spotlights the corresponding answer with an animated badge (`Q# Answer`).
- **🤖 Context-Aware AI Grading & Feedback:** Evaluates student responses individually against maximum marks and generates unique, constructivist feedback tailored to each student's specific written concepts.
- **🛡️ 4-Tier Resilient Fallback Engine:** Guarantees 100% uptime even during AI API outages or rate limits:
  1. **Primary:** PDF.js embedded text + transformation matrix coordinate extraction.
  2. **Secondary:** Gemini Vision AI Multimodal Bounding Box API.
  3. **Tertiary:** Local Client/Server Tesseract.js OCR engine.
  4. **Quaternary:** Intelligent dynamic proportional layout distributor.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/) with [Turbopack](https://turbo.build/pack)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **PDF & OCR Processing:** [PDF.js (pdfjs-dist)](https://mozilla.github.io/pdf.js/) & [Tesseract.js](https://tesseract.projectnaptha.com/)
- **AI / LLM Engine:** [Google Gemini API](https://ai.google.dev/) (`gemini-1.5-flash` / `gemini-1.5-pro` with automatic failover)

---

## 🔍 Technical Challenges & Issues Faced (Post-Mortem & Solutions)

Building a truly dynamic document evaluation tool that works across any arbitrary PDF or scan introduced several non-trivial engineering challenges:

### 1. Vision Model Bounding Box Drift & Cascading Errors
- **The Issue:** Multimodal Vision LLMs (e.g., Gemini Vision) frequently hallucinate or produce cumulative vertical offsets (`bbox.y` drift) on dense pages, starting high and gradually drifting down or cutting off top/bottom lines of multi-line answers.
- **The Solution:** Rather than relying blindly on LLM-estimated bounding boxes, we engineered a **hybrid coordinate extractor**. We tap directly into PDF.js `item.transform[5]` matrices during rendering to measure exact physical text line heights and boundaries, eliminating all vertical drift.

### 2. PDF Text Stream Flattening into a Single Line
- **The Issue:** Standard PDF.js text extraction joins all tokens with whitespace (`items.map(i => i.str).join(' ')`), collapsing multi-paragraph student answers into a single line (`lines.length = 1`), which broke line-based layout calculations.
- **The Solution:** We implemented delta-Y position tracking (`Math.abs(itemY - lastY) > 2`) inside `lib/pdfToImages.ts` to detect authentic line breaks and embed normalized page-percentage coordinates (`[Y:XX.XX]`) for every extracted line.

### 3. Rate Limits (HTTP 429) & Model Deprecation (HTTP 404)
- **The Issue:** High-frequency exam grading quickly hit free-tier LLM rate limits (429) or broke when legacy model tags were deprecated (e.g., `gemini-2.0-flash` 404s).
- **The Solution:** 
  - Added multi-model auto-rotation (`gemini-1.5-flash`, `gemini-1.5-pro`, etc.) in `lib/gemini.ts`.
  - Built an offline fallback heuristic in `app/api/grade/route.ts` that evaluates answer completeness, keyword matching, and generates constructive teacher feedback without failing the UI.

### 4. Zero Hardcoded Offsets for Arbitrary PDFs
- **The Issue:** Fixed margin assumptions (`startY = 18.2%`, `endY = 89.5%`) failed whenever students used different header formats, table heights, or page margins.
- **The Solution:** Built a dynamic header-detection algorithm that inspects top rows for student metadata tables (`Roll No`, `Subject`, `Class`) and dynamically calculates available vertical space for answer blocks.

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/vedaai-assignment.git
cd vedaai-assignment
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
vedaai-assignment/
├── app/
│   ├── api/
│   │   ├── extract-answers/    # Dynamic answer extraction & coordinate engine
│   │   ├── extract-questions/  # Question paper parsing API
│   │   └── grade/              # Multi-tier grading & feedback API
│   ├── mapping/                # Split-screen assessment interface
│   ├── upload/                 # Dual PDF/image upload portal
│   ├── layout.tsx              # Root layout & Google Fonts
│   └── page.tsx                # Landing page
├── components/
│   ├── AnswerViewer.tsx        # Canvas/image renderer with zoom & scroll sync
│   ├── HighlightOverlay.tsx    # SVG/CSS bounding box & badge renderer
│   ├── QuestionList.tsx        # Expandable question & AI feedback sidebar
│   └── UploadBox.tsx           # Drag-and-drop file uploader
├── lib/
│   ├── gemini.ts               # Gemini API client & failover handling
│   ├── ocr.ts                  # Local Tesseract.js fallback OCR
│   ├── pdfToImages.ts          # PDF rendering & coordinate-preserving extraction
│   └── prompt.ts               # Engineered prompt templates
├── public/                     # Static assets
├── screenshots/                # Showcase images for documentation
└── README.md                   # Project documentation
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---

## 📜 License

This project is licensed under the MIT License.
