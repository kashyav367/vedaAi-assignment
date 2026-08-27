const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const match = envFile.match(/GEMINI_API_KEY=(.+)/);
const apiKey = match ? match[1].trim() : '';

function normalizeQKey(str) {
  if (!str) return '';
  return str.toString().toLowerCase().replace(/^q(?:uestion)?\s*/i, '').replace(/[^a-z0-9]/g, '');
}

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
   - questionNumber: The exact question number digit/subpart for this answer matching the expected questions list (e.g. "1", "2", "3", "4", "5", "6", "7", "8").
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

  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  let parsed;
  try {
    let cleaned = rawText.trim().replace(/^```(?:json)?/gi, '').replace(/```$/gi, '').trim();
    const fb = cleaned.indexOf('{');
    const lb = cleaned.lastIndexOf('}');
    if (fb !== -1 && lb !== -1) cleaned = cleaned.substring(fb, lb + 1);
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.error('Parse error:', e);
    return;
  }

  const normExpected = expectedQuestions.map(normalizeQKey);
  let answerBlocks = (parsed.answers || []).map(a => ({ ...a, page: 1 }));

  // Filter out header
  answerBlocks = answerBlocks.filter(a => {
    const y = a.bbox?.y || 0;
    const txt = (a.text || '').toLowerCase();
    if (y < 12 && (txt.includes('student answer sheet') || txt.includes('roll no') || txt.includes('class:'))) {
      return false;
    }
    return true;
  });

  // Sort by Y top-to-bottom
  answerBlocks.sort((a, b) => (a.bbox?.y || 0) - (b.bbox?.y || 0));

  // Match question numbers cleanly
  answerBlocks = answerBlocks.map(a => {
    let qNum = (a.questionNumber || '').toString().trim();
    let norm = normalizeQKey(qNum);
    // If not matching expected directly, check if text starts with question number
    if (!normExpected.includes(norm)) {
      const match = a.text?.match(/^(?:q(?:uestion)?\s*)?(\d+[a-z]?)/i);
      if (match) {
        const extractedNorm = normalizeQKey(match[1]);
        if (normExpected.includes(extractedNorm)) {
          qNum = match[1];
        }
      }
    }
    return {
      ...a,
      questionNumber: qNum
    };
  });

  // Add nice bounding box padding for visual perfection
  answerBlocks = answerBlocks.map((a, idx) => {
    let { x = 4, y = 0, width = 92, height = 6 } = a.bbox || {};
    
    // Add small top/left padding so box doesn't touch the text tightly
    const paddedX = Math.max(3, x - 1);
    const paddedY = Math.max(0, y - 0.6);
    const paddedWidth = Math.min(94, width + 2);
    
    // Ensure height is reasonable and doesn't overlap next block's Y
    let maxAllowedH = height + 1;
    if (idx < answerBlocks.length - 1) {
      const nextY = answerBlocks[idx + 1].bbox?.y || (y + height + 5);
      maxAllowedH = Math.max(height, nextY - paddedY - 0.8);
    }
    const paddedHeight = Math.max(5, Math.min(height + 1.2, maxAllowedH));

    return {
      ...a,
      bbox: {
        x: Number(paddedX.toFixed(1)),
        y: Number(paddedY.toFixed(1)),
        width: Number(paddedWidth.toFixed(1)),
        height: Number(paddedHeight.toFixed(1)),
      }
    };
  });

  console.log('--- PROCESSED ANSWERS ---');
  console.log(JSON.stringify(answerBlocks, null, 2));
}

test().catch(console.error);
