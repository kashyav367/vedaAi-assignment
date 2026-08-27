const samplePaper = `
1. What is a variable in JavaScript? [2 marks]
2. What is the difference between let and const ? [2 marks]
3. Explain what an API is and give one real-world example. [2 marks]
4. What is JSON? Write one example of a JSON object. [2 marks]
5. What is the purpose of a database? [2 marks]
6. Explain the difference between client-side rendering and server-side rendering with suitable examples. [4 marks]
7. Explain asynchronous programming in JavaScript. What are Promises and async/await? [4 marks]
8. Describe the steps involved in converting a PDF page into an image and sending that image to an AI model. [4 marks]
9(a). Base64 is an encoding method that represents binary data as text. [2 marks]
9(b). A bounding box identifies the location of an object or answer inside an image. [2 marks]
`;

function parseQuestionsWithSubparts(rawText) {
  const lines = rawText.split('\n').filter(l => l.trim().length > 0);
  const questions = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Match 1., 2., 9a., 9(a)., Q9(a):
    const match = line.match(/^(?:Q|Question)?\s*(\d+)\s*(?:\(?([a-z])\)?|\.([a-z]))?\s*[\.\:\)]\s*(.*)/i);
    if (match) {
      const num = match[1];
      const subpart = match[2] || match[3] || null;
      let qText = match[4].trim();

      const marksMatch = qText.match(/[\(\[]\s*(\d+)\s*(?:marks?|pts?|m)?\s*[\)\]]/i);
      const maxMarks = marksMatch ? parseInt(marksMatch[1], 10) : null;

      questions.push({
        number: num,
        subpart: subpart ? subpart.toLowerCase() : null,
        text: qText,
        maxMarks
      });
    }
  }

  return questions;
}

const parsed = parseQuestionsWithSubparts(samplePaper);
console.log(`PARSED ${parsed.length} QUESTIONS WITH SUBPARTS:`);
parsed.forEach(q => {
  const label = q.subpart ? `${q.number}(${q.subpart})` : `Q${q.number}`;
  console.log(`${label} [${q.maxMarks}m]: ${q.text.slice(0, 50)}...`);
});
