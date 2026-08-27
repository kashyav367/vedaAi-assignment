const fs = require('fs');

const expectedQuestions = Array.from({ length: 25 }, (_, i) => `${i + 1}`);

console.log('Testing 25 questions global mapping...');
console.log('Expected:', expectedQuestions);

const samplePageAnswers = [
  // Page 1
  [
    { questionNumber: '1', bbox: { x: 5, y: 15, width: 90, height: 15 }, text: 'Q1. What is a data structure?' },
    { questionNumber: '2', bbox: { x: 5, y: 35, width: 90, height: 12 }, text: 'Q2. Advantages of a linked list over an array' },
    { questionNumber: '3', bbox: { x: 5, y: 50, width: 90, height: 10 }, text: 'Q3. Node and head pointer' },
    { questionNumber: '4', bbox: { x: 5, y: 65, width: 90, height: 10 }, text: 'Q4. Singly vs Doubly Linked List' },
    { questionNumber: '5', bbox: { x: 5, y: 80, width: 90, height: 15 }, text: 'Q5. Time complexity and Big-O' },
  ],
  // Page 2 (Continuation of Q5)
  [
    { questionNumber: '', bbox: { x: 5, y: 5, width: 90, height: 10 }, text: 'Time complexity describes how the running time...' }
  ],
  // Page 3
  [
    { questionNumber: '6', bbox: { x: 5, y: 10, width: 90, height: 20 }, text: 'Q6. Insertion and deletion in a singly linked list' },
    { questionNumber: '7', bbox: { x: 5, y: 35, width: 90, height: 15 }, text: 'Q7. Circular linked list' },
    { questionNumber: '8', bbox: { x: 5, y: 55, width: 90, height: 20 }, text: 'Q8. Floyd’s Cycle Detection Algorithm' },
    { questionNumber: '9', bbox: { x: 5, y: 80, width: 90, height: 15 }, text: 'Q9. Pseudocode for cycle detection' }
  ],
  // Page 4 (Continuation of Q9)
  [
    { questionNumber: '', bbox: { x: 5, y: 5, width: 90, height: 10 }, text: 'The two NULL checks are important...' }
  ],
  // Page 5
  [
    { questionNumber: '10', bbox: { x: 5, y: 10, width: 90, height: 20 }, text: 'Q10. Example: 10 -> 20 -> 30' },
    { questionNumber: '11', bbox: { x: 5, y: 35, width: 90, height: 15 }, text: 'Q11. Floyd vs Hash Set' },
    { questionNumber: '12', bbox: { x: 5, y: 55, width: 90, height: 15 }, text: 'Q12. Finding the starting node' },
    { questionNumber: '13', bbox: { x: 5, y: 75, width: 90, height: 20 }, text: 'Q13. Complete working of Floyd algorithm' }
  ],
  // Page 6
  [
    { questionNumber: '14', bbox: { x: 5, y: 10, width: 90, height: 25 }, text: 'Q14. Program to detect a cycle' },
    { questionNumber: '15', bbox: { x: 5, y: 40, width: 90, height: 20 }, text: 'Q15. Real-world applications' },
    { questionNumber: '16', bbox: { x: 5, y: 65, width: 90, height: 25 }, text: 'Q16. 1000-node list where last node points to 400' }
  ],
  // Page 7
  [
    { questionNumber: '17', bbox: { x: 5, y: 10, width: 90, height: 20 }, text: 'Q17. Navigation history' },
    { questionNumber: '18', bbox: { x: 5, y: 35, width: 90, height: 25 }, text: 'Q18. Reversing a singly linked list' },
    { questionNumber: '19', bbox: { x: 5, y: 65, width: 90, height: 15 }, text: 'Q19. Why is Floyd algorithm O(1) space?' },
    { questionNumber: '20', bbox: { x: 5, y: 85, width: 90, height: 10 }, text: 'Q20. Arrays vs linked lists' }
  ],
  // Page 8 (Continuation of Q20)
  [
    { questionNumber: '', bbox: { x: 5, y: 5, width: 90, height: 10 }, text: 'backward traversal at the cost of additional memory...' }
  ],
  // Page 9
  [
    { questionNumber: '21', bbox: { x: 5, y: 10, width: 90, height: 35 }, text: 'Q21. Detect, locate, and remove a cycle' },
    { questionNumber: '22', bbox: { x: 5, y: 50, width: 90, height: 20 }, text: 'Q22. Why is NULL check insufficient?' },
    { questionNumber: '23', bbox: { x: 5, y: 75, width: 90, height: 20 }, text: 'Q23. Cycle vs normal termination' }
  ],
  // Page 10 (Continuation of Q23)
  [
    { questionNumber: '', bbox: { x: 5, y: 5, width: 90, height: 10 }, text: 'traversal can continue indefinitely unless...' }
  ],
  // Page 11
  [
    { questionNumber: '24', bbox: { x: 5, y: 10, width: 90, height: 20 }, text: 'Q24. Complexity of Floyd algorithm' },
    { questionNumber: '25', bbox: { x: 5, y: 35, width: 90, height: 20 }, text: 'Q25. Why is it called tortoise and hare?' }
  ]
];

function normalizeQKey(str) {
  if (!str) return '';
  return str.toString().toLowerCase().replace(/^q(?:uestion)?\s*/i, '').replace(/[^a-z0-9]/g, '');
}

const normExpected = expectedQuestions.map(normalizeQKey);
const allAnswers = [];
let globalExpectedIdx = 0;

for (let i = 0; i < samplePageAnswers.length; i++) {
  let answerBlocks = samplePageAnswers[i];

  answerBlocks = answerBlocks.map((a) => {
    let rawKey = (a.questionNumber || '').toString().trim();
    let norm = normalizeQKey(rawKey);

    if (norm && normExpected.includes(norm)) {
      const matchIdx = normExpected.indexOf(norm);
      globalExpectedIdx = Math.max(globalExpectedIdx, matchIdx + 1);
      return { ...a, questionNumber: expectedQuestions[matchIdx], page: i + 1 };
    }

    const textMatch = (a.text || '').match(/^(?:q(?:uestion)?\s*)?(\d+[a-z]?)/i);
    if (textMatch) {
      const extractedNorm = normalizeQKey(textMatch[1]);
      if (normExpected.includes(extractedNorm)) {
        const matchIdx = normExpected.indexOf(extractedNorm);
        globalExpectedIdx = Math.max(globalExpectedIdx, matchIdx + 1);
        return { ...a, questionNumber: expectedQuestions[matchIdx], page: i + 1 };
      }
    }

    if (globalExpectedIdx > 0 && globalExpectedIdx <= expectedQuestions.length) {
      const isTopContinuation = (a.bbox?.y || 0) < 20;
      const assignedIdx = isTopContinuation ? Math.max(0, globalExpectedIdx - 1) : Math.min(globalExpectedIdx, expectedQuestions.length - 1);
      if (!isTopContinuation) {
        globalExpectedIdx = assignedIdx + 1;
      }
      return { ...a, questionNumber: expectedQuestions[assignedIdx], page: i + 1 };
    }

    return { ...a, page: i + 1 };
  });

  allAnswers.push(...answerBlocks);
}

console.log('RESULTS MAPPING:');
allAnswers.forEach(a => {
  console.log(`Page ${a.page} | Q${a.questionNumber} -> "${a.text.slice(0, 45)}..."`);
});
