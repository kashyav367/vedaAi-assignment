import fs from 'fs';

const imageBase64 = fs.readFileSync('./test-answer-sheet.png').toString('base64');
const apiKey = process.env.GEMINI_API_KEY;

const prompt = `This is a page from a student's handwritten answer sheet.
For each answer visible on this page, identify:
- questionNumber: the question number this answer belongs to (e.g. "1", "2", "11a"). If a section doesn't clearly belong to any question number, use "unmatched".
- bbox: bounding box as PERCENTAGE of the full page image, top-left origin: {x, y, width, height} where x,y is top-left corner and width,height are the size, all 0-100.
- text: a brief transcription of what is written (handwriting to text).

Return ONLY valid JSON in this exact format, no markdown, no extra text:
{"answers":[{"questionNumber":"1","bbox":{"x":10,"y":15,"width":80,"height":20},"text":"..."}]}`;

const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: 'image/png', data: imageBase64 } }
        ]
      }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  }
);

const data = await res.json();
console.log(JSON.stringify(data, null, 2));