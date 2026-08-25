import fs from 'fs';

const imageBase64 = fs.readFileSync('./test-question-paper.png').toString('base64');
const apiKey = process.env.GEMINI_API_KEY;

const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: 'Extract all questions from this paper as JSON: {"questions":[{"number":"1","text":"..."}]}' },
          { inline_data: { mime_type: 'image/png', data: imageBase64 } }
        ]
      }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  }
);

const data = await res.json();
console.log(JSON.stringify(data, null, 2));