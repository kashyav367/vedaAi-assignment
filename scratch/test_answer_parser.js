const sampleAnswerSheetText = `
1. A variable is a named container used to store data in a program. In JavaScript, variables can be declared using let, const, or var. For example, let age = 20 stores the value 20 in the variable age.

2. The main difference between let and const is that a let variable can be reassigned, while a const variable cannot be reassigned after its initial value is given. Both are block scoped.

3. An API is a way for two software applications to communicate with each other. For example, a weather application can use a weather API to request the current temperature from a server.

4. JSON stands for JavaScript Object Notation. It is a lightweight format used to exchange structured data. Example: { "name": "Ankit", "age": 22 }.

5. A database stores and organizes information so that applications can efficiently create, read, update, and delete data. It also helps keep large amounts of information organized.

6. Client-side rendering means the browser creates much of the page using JavaScript after receiving the application data. Server-side rendering means the server generates the HTML and sends the rendered page to the browser. SSR can improve initial loading and search engine visibility, while CSR can provide highly interactive application experiences.

7. Asynchronous programming allows a program to start a task without blocking other work while it waits for the task to finish. A Promise represents a future result. async and await provide a simpler syntax for working with Promises. For example, await fetch(url) waits for the network result without blocking the JavaScript thread in the usual synchronous sense.

8. A PDF page can be loaded with a PDF library, rendered onto a canvas, converted to a PNG image, and then encoded as Base64. The Base64 image and an instruction prompt can be sent to an AI model that can analyze the visual content and return structured information.

9(a). Base64 is an encoding method that represents binary data as text. It can be useful when an API expects image data inside a JSON request body because the image can be represented as a string.

9(b). A bounding box identifies the location of an object or answer inside an image. It can be represented using x, y, width, and height values. These coordinates allow the application to draw a highlight around the student's answer.
`;

function normalizeQKey(str) {
  if (!str) return '';
  return str.toString().toLowerCase().replace(/^q(?:uestion)?\s*/i, '').replace(/[^a-z0-9]/g, '');
}

function parseAnswersFromPdfText(rawText, expectedQuestions) {
  const normExpected = expectedQuestions.map(normalizeQKey);
  const pageSections = rawText.includes('--- PAGE ') ? rawText.split(/--- PAGE (\d+) ---/) : ['1', rawText];
  const answers = [];
  let globalExpectedIdx = 0;

  for (let i = 0; i < pageSections.length; i += (rawText.includes('--- PAGE ') ? 2 : 1)) {
    const currentPage = rawText.includes('--- PAGE ') ? (parseInt(pageSections[i], 10) || 1) : 1;
    const pageText = rawText.includes('--- PAGE ') ? (pageSections[i + 1] || '') : pageSections[i];

    if (!pageText.trim()) continue;

    const lines = pageText.split('\n').filter((l) => l.trim().length > 0);
    const totalLines = lines.length;
    if (totalLines === 0) continue;

    const itemPositions = [];
    for (let l = 0; l < lines.length; l++) {
      const line = lines[l].trim();
      const match = line.match(/^(?:q(?:uestion)?\s*)?(\d+)\s*(?:\(?([a-z])\)?|\.([a-z]))?\s*[\.\:\)]/i);
      if (match) {
        const num = match[1];
        const subpart = match[2] || match[3] || '';
        const rawNum = subpart ? `${num}${subpart}` : num;
        itemPositions.push({
          num: rawNum,
          lineIdx: l,
          lineText: line,
        });
      }
    }

    for (let k = 0; k < itemPositions.length; k++) {
      const item = itemPositions[k];
      const nextItem = itemPositions[k + 1];

      const startLine = item.lineIdx;
      const endLine = nextItem ? nextItem.lineIdx : totalLines;
      const lineSpan = endLine - startLine;

      const yPercent = Math.min(88, Math.max(5, Number((5 + (startLine / totalLines) * 85).toFixed(1))));
      const heightPercent = Math.min(30, Math.max(5, Number(((lineSpan / totalLines) * 85).toFixed(1))));

      const fullText = lines.slice(startLine, endLine).join(' ').trim();
      const norm = normalizeQKey(item.num);

      let mappedNum = item.num;
      if (normExpected.includes(norm)) {
        const matchIdx = normExpected.indexOf(norm);
        mappedNum = expectedQuestions[matchIdx];
        globalExpectedIdx = Math.max(globalExpectedIdx, matchIdx + 1);
      } else if (globalExpectedIdx < expectedQuestions.length) {
        mappedNum = expectedQuestions[globalExpectedIdx];
        globalExpectedIdx++;
      }

      if (fullText.length > 5 && !fullText.toLowerCase().includes('student answer sheet')) {
        answers.push({
          questionNumber: mappedNum,
          page: currentPage,
          bbox: {
            x: 5,
            y: yPercent,
            width: 90,
            height: heightPercent,
          },
          text: fullText,
        });
      }
    }
  }

  return answers;
}

const expectedQuestions = ['1', '2', '3', '4', '5', '6', '7', '8', '9a', '9b'];
const parsedAnswers = parseAnswersFromPdfText(sampleAnswerSheetText, expectedQuestions);

console.log('EXACT ANSWER PARSING & ACCURATE HIGHLIGHT COORDINATES:');
parsedAnswers.forEach((a) => {
  console.log(`Q${a.questionNumber} | page ${a.page} | y: ${a.bbox.y}%, h: ${a.bbox.height}% | "${a.text.slice(0, 45)}..."`);
});
