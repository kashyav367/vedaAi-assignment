const sampleQPaperText = `
QUESTION PAPER
Subject: Computer Science / Data Structures
Time: 2 Hours Maximum Marks: 50
Instructions
1. Answer all questions.
2. Write clear and well-structured answers.
3. Draw diagrams wherever necessary.
4. Assume suitable examples if required.
Section A — Short Answer Questions
Q1. What is a data structure? Explain the difference between linear and non-linear data structures with suitable examples.
Q2. Define a linked list. Mention any four advantages of a linked list over an array.
Q3. What is a node in a linked list? Explain the purpose of the head pointer.
Q4. Explain the difference between singly linked list and doubly linked list.
Q5. What is time complexity? Explain why Big-O notation is used in algorithm analysis.
Section B — Conceptual Questions
Q6. Explain insertion and deletion operations in a singly linked list. Include the steps involved.
Q7. What is a circular linked list? Explain one practical application of it.
QUESTION PAPER — PAGE 2
Section C — Algorithm & Problem Solving
Q8. Explain Floyd’s Cycle Detection Algorithm. How do the slow and fast pointers work?
Q9. Write an algorithm/pseudocode to detect whether a linked list contains a cycle.
Q10. Consider the linked list: 10 -> 20 -> 30 -> 40 -> 50 -> 30. Identify whether a cycle exists.
Q11. Compare the time and space complexity of Floyd’s Cycle Detection Algorithm with an approach that uses a hash set.
Q12. Explain how the starting node of a cycle can be found after the slow and fast pointers meet.
Section D — Long Answer Questions
Q13. Explain the complete working of Floyd’s Cycle Detection Algorithm with a neat diagram.
Q14. Write a program to implement cycle detection in a singly linked list.
Q15. Discuss at least three real-world situations where linked lists can be useful.
Section E — Analytical Question
Q16. A linked list contains 1000 nodes, and the last node points back to the 400th node. Explain how you would detect the cycle.
QUESTION PAPER — PAGE 3
Section F — Application-Based Questions
Q17. You are given a linked list representing user navigation history...
Q18. Write pseudocode to reverse a singly linked list...
Q19. Explain why Floyd’s algorithm uses O(1) extra space...
Q20. Give a detailed comparison between arrays, singly linked lists, doubly linked lists, and circular linked lists...
Section G — Challenge Question
Q21. Given a linked list with a cycle, design an algorithm that: a) Detects cycle b) Finds meeting point c) Finds entry d) Removes cycle
Section H — Viva / Quick Revision
Q22. Why can’t a simple traversal using only a NULL check detect every linked-list problem?
Q23. What is the difference between a cycle and a normal termination in a linked list?
Q24. State the best-case and worst-case time complexity of Floyd’s cycle detection algorithm.
Q25. Why is Floyd’s algorithm also known as the tortoise and hare algorithm?
End of Question Paper
`;

function parseQuestionsFromText(rawText) {
  const questions = [];
  const regex = /(?:Q|Question)\s*(\d+)\s*[\.\:\)]\s*([\s\S]*?)(?=(?:Q|Question)\s*\d+\s*[\.\:\)]|Section\s+[A-Z]|End of Question Paper|$)/gi;
  let match;
  while ((match = regex.exec(rawText)) !== null) {
    const num = match[1];
    let qText = match[2].trim().replace(/\n+/g, ' ');
    if (qText.length > 5) {
      questions.push({
        number: num,
        subpart: null,
        text: qText,
        maxMarks: 2
      });
    }
  }
  return questions;
}

const extracted = parseQuestionsFromText(sampleQPaperText);
console.log(`PARSED ${extracted.length} QUESTIONS FROM PDF TEXT:`);
extracted.forEach(q => console.log(`Q${q.number}: ${q.text.slice(0, 50)}...`));
