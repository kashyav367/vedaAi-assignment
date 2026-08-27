const rawAnswers = [
  { questionNumber: '1', page: 1, text: '1. A variable is a named container used to store data in a program. In JavaScript, variables can be declared using let, const, or var. For example, let age = 20 stores the value 20 in the variable age.' },
  { questionNumber: '2', page: 1, text: '2. The main difference between let and const is that a let variable can be reassigned, while a const variable cannot be reassigned after its initial value is given. Both are block scoped.' },
  { questionNumber: '6', page: 1, text: '6. Client-side rendering means the browser creates much of the page using JavaScript after receiving the application data. Server-side rendering means the server generates the HTML and sends the rendered page to the browser. SSR can improve initial loading and search engine visibility, while CSR can provide highly interactive application experiences.' }
];

function normalizeKey(str) {
  if (!str) return '';
  return str.toString().toLowerCase().replace(/^q(?:uestion)?\s*/i, '').replace(/[^a-z0-9]/g, '');
}

function matchesQuestion(aNum, selectedKey) {
  const k1 = normalizeKey(aNum);
  const k2 = normalizeKey(selectedKey);
  if (!k1 || !k2) return false;
  return k1 === k2;
}

console.log('--- VERIFYING SELECTION MATCHING & HIGHLIGHTING ---');

['1', '2', '6'].forEach((selectedQ) => {
  const matched = rawAnswers.filter((a) => matchesQuestion(a.questionNumber, selectedQ));
  if (matched.length > 0) {
    const a = matched[0];
    console.log(`[SUCCESS] Selected Question "${selectedQ}" -> Matched Answer: Q${a.questionNumber} on Page ${a.page} | Text length: ${a.text.length} chars`);
  } else {
    console.log(`[FAILED] Selected Question "${selectedQ}" -> No match found`);
  }
});
