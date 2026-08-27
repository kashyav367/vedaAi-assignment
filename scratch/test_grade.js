const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const match = envFile.match(/GEMINI_API_KEY=(.+)/);
const apiKey = match ? match[1].trim() : '';

const itemsToGrade = [
  { key: '1', questionText: 'What is a variable in JavaScript?', answerText: 'A variable is a named container used to store data in a program. In JavaScript, variables can be declared using let, const, or var.', maxMarks: 2 },
  { key: '2', questionText: 'What is the difference between let and const?', answerText: 'The main difference between let and const is that a let variable can be reassigned, while a const variable cannot be reassigned after its initial value is given.', maxMarks: 2 },
  { key: '3', questionText: 'Explain what an API is and give one real-world example.', answerText: 'An API is a way for two software applications to communicate with each other.', maxMarks: 2 },
  { key: '4', questionText: 'What is JSON? Write one example of a JSON object.', answerText: 'JSON stands for JavaScript Object Notation. It is a lightweight format used to exchange structured data. Example: { "name": "Ankit", "age": 22 }.', maxMarks: 2 },
  { key: '5', questionText: 'What is the purpose of a database?', answerText: 'A database stores and organizes information so that applications can efficiently create, read, update, and delete data.', maxMarks: 2 },
  { key: '6', questionText: 'Explain the difference between client-side rendering and server-side rendering with suitable examples.', answerText: 'Client-side rendering means the browser creates much of the page using JavaScript after receiving application data. Server-side rendering means the server generates the HTML and sends the rendered page.', maxMarks: 4 }
];

async function test() {
  const prompt = `You are an expert teacher grading a student's answer sheet.

Grade EACH of the following student answers INDIVIDUALLY based on the specific question content.
For EACH question, write UNIQUE, SPECIFIC, and CONSTRUCTIVE feedback (1-2 sentences) directly addressing what the student wrote for THAT specific question. DO NOT use generic repetitive template phrases!

Items to grade:
${itemsToGrade.map((item) => `
--- Item Key: "${item.key}" ---
Question: ${item.questionText}
Student Answer: ${item.answerText}
Max Marks: ${item.maxMarks}
`).join('\n')}

Return ONLY valid JSON with no markdown formatting:
{
  "results": [
    { "key": "1", "score": 2, "feedback": "Specific feedback for question 1" }
  ]
}`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });

  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log('--- GEMINI FULL RESPONSE ---');
  console.log(JSON.stringify(data, null, 2));
}

test().catch(console.error);
