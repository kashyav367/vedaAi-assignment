const pageText = `
3. An API is a way for two software applications to communicate with each other. For example, a weather application can use a weather API to request the current temperature from a server.

4. JSON stands for JavaScript Object Notation. It is a lightweight format used to exchange structured data. Example: { "name": "Ankit", "age": 22 }.

5. A database stores and organizes information so that applications can efficiently create, read, update, and delete data. It also helps keep large amounts of information organized.

6. Client-side rendering means the browser creates much of the page using JavaScript after receiving the application data. Server-side rendering means the server generates the HTML and sends the rendered page to the browser. SSR can improve initial loading and search engine visibility, while CSR can provide highly interactive application experiences.

7. Asynchronous programming allows a program to start a task without blocking other work while it waits for the task to finish. A Promise represents a future result. async and await provide a simpler syntax for working with Promises. For example, await fetch(url) waits for the network result without blocking the JavaScript thread in the usual synchronous sense.

8. A PDF page can be loaded with a PDF library, rendered onto a canvas, converted to a PNG image, and then encoded as Base64. The Base64 image and an instruction prompt can be sent to an AI model that can analyze the visual content and return structured information.

9(a). Base64 is an encoding method that represents binary data as text. It can be useful when an API expects image data inside a JSON request body because the image can be represented as a string.

9(b). A bounding box identifies the location of an object or answer inside an image. It can be represented using x, y, width, and height values. These coordinates allow the application to draw a highlight around the student's answer.
`;

function calculateExactBboxes(rawText, expectedQuestions) {
  const lines = rawText.split('\n').filter(l => l.trim().length > 0);
  const totalLines = lines.length;
  const itemPositions = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const match = line.match(/^(?:q(?:uestion)?\s*)?(\d+[a-z]?|\d+\([a-z]\))/i);
    if (match) {
      const rawNum = match[1].replace(/[\(\)]/g, '');
      itemPositions.push({
        num: rawNum,
        lineIdx: i,
        lineText: line
      });
    }
  }

  const results = [];
  for (let i = 0; i < itemPositions.length; i++) {
    const item = itemPositions[i];
    const nextItem = itemPositions[i + 1];

    const startLine = item.lineIdx;
    const endLine = nextItem ? nextItem.lineIdx : totalLines;
    const lineSpan = endLine - startLine;

    // Top margin offset (header is ~8% of page)
    const yPercent = Math.min(88, Math.max(8, Number((8 + (startLine / totalLines) * 82).toFixed(1))));
    const heightPercent = Math.min(30, Math.max(6, Number(((lineSpan / totalLines) * 82).toFixed(1))));

    // Collect full answer text for this item
    const fullText = lines.slice(startLine, endLine).join(' ').trim();

    results.push({
      questionNumber: item.num,
      bbox: {
        x: 5,
        y: yPercent,
        width: 90,
        height: heightPercent
      },
      text: fullText
    });
  }

  return results;
}

const res = calculateExactBboxes(pageText, ['1', '2', '3', '4', '5', '6', '7', '8', '9a', '9b']);
console.log('CALCULATED EXACT BBOXES FROM PAGE TEXT LAYOUT:');
res.forEach(r => console.log(`Q${r.questionNumber} | y: ${r.bbox.y}%, h: ${r.bbox.height}% | "${r.text.slice(0, 50)}..."`));
