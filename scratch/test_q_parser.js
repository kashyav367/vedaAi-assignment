const paper1 = `
SECTION A
1. Define Data Structure. Explain the classification of data structures with suitable examples. (7 Marks)
2. Explain arrays and their basic operations. Write an algorithm for insertion and deletion in an array. (7 Marks)
3. What is a linked list? Explain singly linked list with insertion and deletion operations. (7 Marks)
4. Compare arrays and linked lists. Mention at least five differences. (7 Marks)
SECTION B
5. Explain stack ADT. Describe PUSH and POP operations with algorithms and examples. (7 Marks)
6. Explain queue and circular queue. Write algorithms for insertion and deletion in a circular queue. (7 Marks)
7. What is recursion? Explain recursion using factorial and Fibonacci examples. (7 Marks)
8. Explain the concept of time complexity. Differentiate O(1), O(log n), O(n), and O(n²) with examples. (7 Marks)
SECTION C
9. Explain binary trees and their terminology. Describe preorder, inorder, and postorder traversals with an example. (7 Marks)
10. What is a Binary Search Tree? Explain insertion, searching, and deletion in a BST. (7 Marks)
11. Explain graph representation using adjacency matrix and adjacency list. Compare both methods. (7 Marks)
12. Explain BFS and DFS graph traversal algorithms with suitable examples. (7 Marks)
`;

function parseQuestionsFromText(rawText) {
  const questions = [];
  const regex = /(?:Q|Question)?\s*(\d+[a-z]?)\s*[\.\:\)]\s*([\s\S]*?)(?=(?:Q|Question)?\s*\d+[a-z]?\s*[\.\:\)]|SECTION\s+[A-Z]|Section\s+[A-Z]|End of Question Paper|$)/gi;
  let match;

  while ((match = regex.exec(rawText)) !== null) {
    const numStr = match[1].trim();
    let qText = match[2].trim().replace(/\s+/g, ' ');
    qText = qText.replace(/(?:SECTION|Section)\s+[A-Z]\s*—?\s*[^\.]*$/i, '').trim();

    if (qText.length > 5 && !qText.toLowerCase().includes('instructions') && !qText.toLowerCase().includes('time:')) {
      const subpartMatch = numStr.match(/^(\d+)([a-z])$/i);
      const number = subpartMatch ? subpartMatch[1] : numStr;
      const subpart = subpartMatch ? subpartMatch[2] : null;

      questions.push({
        number,
        subpart,
        text: qText,
        maxMarks: 7,
      });
    }
  }

  const seen = new Set();
  const unique = [];
  for (const q of questions) {
    const key = q.subpart ? `${q.number}${q.subpart}` : `${q.number}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(q);
    }
  }

  return unique;
}

const res = parseQuestionsFromText(paper1);
console.log(`PARSED ${res.length} QUESTIONS FROM QUESTION PAPER PDF:`);
res.forEach(q => console.log(`Q${q.number}: ${q.text.slice(0, 60)}...`));
