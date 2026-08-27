const rawBlocks = [
  { questionNumber: '1', text: '1. A variable is a named container used to store data in a program. In JavaScript, variables can be declared using let, const, or var. For example, let age = 20 stores the value 20 in the variable age.' },
  { questionNumber: '2', text: '2. The main difference between let and const is that a let variable can be reassigned, while a const variable cannot be reassigned after its initial value is given. Both are block scoped.' },
  { questionNumber: '3', text: '3. An API is a way for two software applications to communicate with each other. For example, a weather application can use a weather API to request the current temperature from a server.' },
  { questionNumber: '4', text: '4. JSON stands for JavaScript Object Notation. It is a lightweight format used to exchange structured data. Example: { "name": "Ankit", "age": 22 }.' },
  { questionNumber: '5', text: '5. A database stores and organizes information so that applications can efficiently create, read, update, and delete data. It also helps keep large amounts of information organized.' },
  { questionNumber: '6', text: '6. Client-side rendering means the browser creates much of the page using JavaScript after receiving the application data. Server-side rendering means the server generates the HTML and sends the rendered page to the browser. SSR can improve initial loading and search engine visibility, while CSR can provide highly interactive application experiences.' },
  { questionNumber: '7', text: '7. Asynchronous programming allows a program to start a task without blocking other work while it waits for the task to finish. A Promise represents a future result. async and await provide a simpler syntax for working with Promises. For example, await fetch(url) waits for the network result without blocking the JavaScript thread in the usual synchronous sense.' },
  { questionNumber: '8', text: '8. A PDF page can be loaded with a PDF library, rendered onto a canvas, converted to a PNG image, and then encoded as Base64. The Base64 image and an instruction prompt can be sent to an AI model that can analyze the visual content and return structured information.' },
  { questionNumber: '9a', text: '9(a). Base64 is an encoding method that represents binary data as text. It can be useful when an API expects image data inside a JSON request body because the image can be represented as a string.' },
  { questionNumber: '9b', text: '9(b). A bounding box identifies the location of an object or answer inside an image. It can be represented using x, y, width, and height values. These coordinates allow the application to draw a highlight around the student\'s answer.' },
];

function layoutAnswerBlocksOnPage(rawBlocks, pageNum) {
  if (!rawBlocks || rawBlocks.length === 0) return [];
  const answerBlocks = rawBlocks.filter((a) => {
    const txt = (a.text || '').toLowerCase();
    return !(txt.includes('student answer sheet') || txt.includes('roll no') || txt.includes('class:'));
  });
  if (answerBlocks.length === 0) return [];

  const startY = pageNum === 1 ? 18.5 : 5.0;
  const endY = pageNum === 1 ? 93.0 : 95.0;
  const gap = 0.4;
  const totalChars = answerBlocks.reduce(
    (sum, a) => sum + Math.max(15, (a.text || '').length),
    0
  );
  const availableHeight = endY - startY - gap * (answerBlocks.length - 1);

  let cursorY = startY;
  return answerBlocks.map((a) => {
    const charLen = Math.max(15, (a.text || '').length);
    const proportion = charLen / totalChars;
    const height = Math.max(3.5, Number((availableHeight * proportion).toFixed(1)));
    const block = {
      ...a,
      page: pageNum,
      bbox: {
        x: 5,
        y: Number(cursorY.toFixed(1)),
        width: 90,
        height,
      },
    };
    cursorY += height + gap;
    return block;
  });
}

const laidOut = layoutAnswerBlocksOnPage(rawBlocks, 1);
console.log('--- REFINED ACCURATE HIGHLIGHT COORDINATES ---');
laidOut.forEach((a) => {
  console.log(`Q${a.questionNumber.padEnd(3)} | y: ${a.bbox.y.toFixed(1)}% | h: ${a.bbox.height.toFixed(1)}% | bottom: ${(a.bbox.y + a.bbox.height).toFixed(1)}%`);
});
