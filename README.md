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

## 🌟 Key Features

- **📄 Automatic Question Paper Extraction:** Decomposes complex question papers into discrete questions and sub-parts (e.g., `9(a)`, `9(b)`) with their allocated marks.
- **🎯 100% Dynamic, Zero-Hardcoded Answer Highlighting:** Targets each student answer on the canvas using vector coordinate mathematics with zero vertical drift.
- **⚡ Synchronized Split-Screen View:** Clicking any question in the left panel smoothly spotlights the corresponding answer with an animated badge (`Q# Answer`).
- **🤖 Context-Aware AI Grading & Feedback:** Evaluates student responses individually against maximum marks and generates unique, constructivist feedback tailored to each student's specific written concepts.
- **🛡️ 4-Tier Resilient Fallback Engine:** Guarantees 100% uptime through a self-healing pipeline (PDF.js Vector Matrix $\rightarrow$ Gemini Vision AI $\rightarrow$ Tesseract.js OCR $\rightarrow$ Heuristic Layout).

---

## 🤖 AI Architecture (What AI Does in This System)

1. **Multimodal Question Decomposition:** Parses unstructured exam papers (tables, columns, nested sub-parts, max marks) and normalizes them into structured JSON evaluation targets.
2. **Semantic Answer Sheet Interpretation:** Scans handwritten/typed student sheets, filters out table headers and noise, and maps student answer paragraphs to the correct question numbers.
3. **Batch Rubric-Grounded Grading & Teacher Feedback:** Evaluates student answers against question criteria in a single batch pass, clamping scores and synthesizing unique feedback grounded in domain terminology written by the student.

---

## 💥 Major Engineering Challenges & Solutions

### 1. Vision Model Bounding Box Drift
- **Problem:** Multimodal LLMs hallucinated vertical percentages across long pages (Q1 was okay, but by Q8-Q9 the green box shifted down by 8%, highlighting the wrong question).
- **Solution:** Replaced LLM visual estimation with **PDF.js `item.transform[5]` vector matrix calculations**, locking highlights mathematically to the actual text glyphs.

### 2. The "Flattened Text Stream" Trap
- **Problem:** Standard `pdfjs` text extraction joined all tokens with spaces, turning a 50-line exam sheet into **1 single line (`lines.length = 1`)**, breaking regexes and collapsing calculated heights to 0.
- **Solution:** Built delta-Y threshold tracking (`Math.abs(itemY - lastY) > 2`) to inject genuine `\n` newlines and embed `[Y:XX.XX]` coordinate tags.

### 3. Eliminating Hardcoded Offsets (`startY = 18.2%`)
- **Problem:** Fixed magic numbers calibrated for one test PDF broke immediately on sheets with different table headers or no headers.
- **Solution:** Implemented dynamic header detection (`Roll No`, `Subject`, `Class`) to calculate adaptive start offsets and variable answer heights.

### 4. Production API Quota & Deprecation Handling
- **Problem:** Free-tier rate limits (HTTP 429) and deprecated preview model tags (`gemini-2.0-flash` 404s) crashed requests.
- **Solution:** Built an automated candidate model failover array (`gemini-1.5-flash` $\rightarrow$ `gemini-1.5-pro`) and an offline cognitive heuristic grading engine.

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/kashyav367/vedaAi-assignment.git
cd vedaai-assignment
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 License

This project is licensed under the MIT License.
