const fs = require('fs');
const path = require('path');

// Read .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const match = envFile.match(/GEMINI_API_KEY=(.+)/);
const apiKey = match ? match[1].trim() : '';

const model = "gemini-1.5-flash"; // or gemini-2.0-flash / gemini-1.5-pro

async function test() {
  const imgBuf = fs.readFileSync('test-answer-sheet.png');
  const base64 = imgBuf.toString('base64');
  const expectedQuestions = ['1', '2', '3', '4', '5', '6', '7', '8'];

  const prompt = `This is a page from a student's answer sheet.

Task: Extract all student answers written on this page and calculate their EXACT bounding boxes covering the FULL answer text.

EXPECTED QUESTIONS LIST (in order): ${expectedQuestions.join(', ')}

Rules:
1. Scan the page strictly from top to bottom.
2. For each answer paragraph, identify:
   - questionNumber: The exact question number digit/subpart for this answer (e.g. "1", "2", "3", "4", "5", "6", "7", "8").
   - bbox: Bounding box as PERCENTAGE (0 to 100) of full image width & height:
     * x: Left margin percentage where the answer starts (typically 4-6%).
     * y: Top edge percentage where the question number label / top line of THIS answer begins (from 0 to 100).
     * width: Width percentage covering the answer text (typically 88-94%).
     * height: Full vertical height percentage covering ALL lines of text from the top line of this answer down to where it finishes before the next question starts.
   - text: Full written text of the student's answer for this question.

CRITICAL ACCURACY RULES:
- Exclude student info header tables (Name, Roll No, Date, Class).
- Ensure bbox.y is the EXACT top of the question label (e.g., top of "1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.").
- Ensure bbox.height is large enough to enclose the ENTIRE answer paragraph (all lines of text from top line to bottom line). DO NOT cut off the top or bottom lines!
- Ensure each questionNumber matches its exact physical answer block on the page in top-to-bottom order.

Return ONLY valid JSON:
{"answers":[{"questionNumber":"1","bbox":{"x":5,"y":14,"width":90,"height":9},"text":"..."}]}`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: 'image/png', data: base64 } }
        ]
      }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });

  console.log('STATUS:', res.status);
  const data = await res.json();
  console.log('RESPONSE DATA:', JSON.stringify(data, null, 2));
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log('--- PARSED JSON TEXT FROM GEMINI ---');
  console.log(rawText);
}

test().catch(console.error);
