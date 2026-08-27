export const QUESTION_EXTRACTION_PROMPT = `You are analyzing a question paper. Extract EVERY question in printed order.

Rules:
- Treat labelled sub-parts as SEPARATE entries (e.g. "11(a)" and "11(b)" are two separate questions)
- Preserve original numbering exactly as printed
- Include max marks if visible, else null

Return ONLY valid JSON, no markdown, no extra text:
{"questions":[{"number":"1","subpart":null,"text":"question text","maxMarks":2}]}`;

export const ANSWER_EXTRACTION_PROMPT = (expectedQuestions?: string[]) => `This is a page from a student's answer sheet.

Task: Extract all student answers written on this page and calculate their EXACT bounding boxes covering the FULL answer text.

${expectedQuestions && expectedQuestions.length > 0 ? `EXPECTED QUESTIONS LIST (in order): ${expectedQuestions.join(', ')}` : ''}

Rules:
1. Scan the page strictly from top to bottom.
2. For each answer paragraph, identify:
   - questionNumber: The exact question number digit/subpart for this answer (e.g. "1", "2", "3", "4", "9a", "9b").
   - bbox: Bounding box as PERCENTAGE (0 to 100) of full image width & height:
     * x: Left margin percentage where the answer starts (typically 4-6%).
     * y: Top edge percentage where the question number label / top line of THIS answer begins (from 0 to 100).
     * width: Width percentage covering the answer text (typically 88-94%).
     * height: Full vertical height percentage covering ALL lines of text from the top line of this answer down to where it finishes before the next question starts.
   - text: Full written text of the student's answer for this question.

CRITICAL ACCURACY RULES:
- Exclude student info header tables (Name, Roll No, Date, Class).
- Ensure bbox.y is the EXACT top of the question label (e.g., top of "1.", "2.", "8.", "9(a).").
- Ensure bbox.height is large enough to enclose the ENTIRE answer paragraph (all lines of text from top line to bottom line). DO NOT cut off the top or bottom lines!
- Ensure each questionNumber matches its exact physical answer block on the page in top-to-bottom order.

Return ONLY valid JSON:
{"answers":[{"questionNumber":"1","bbox":{"x":5,"y":14,"width":90,"height":9},"text":"..."}]}`;

export const GRADING_PROMPT = (questionText: string, answerText: string, maxMarks: number) => `
You are grading a student's answer.

Question: ${questionText}
Student's Answer: ${answerText}
Maximum Marks: ${maxMarks}

Grade this answer fairly out of ${maxMarks} marks. Give brief, constructive feedback (1-2 sentences).

Return ONLY valid JSON, no markdown:
{"score": 2, "feedback": "short feedback here"}`;

export const BATCH_GRADING_PROMPT = (items: Array<{ key: string; questionText: string; answerText: string; maxMarks: number }>) => `
You are an expert teacher grading a student's answer sheet.

Grade EACH of the following student answers INDIVIDUALLY based on the specific question content.
For EACH item, write a 100% UNIQUE, SPECIFIC, and CONSTRUCTIVE teacher feedback (1-2 sentences) directly referencing the concepts written in THAT answer. DO NOT repeat identical template phrases across different questions!

Items to grade:
${items.map((item) => `
--- Item Key: "${item.key}" ---
Question: ${item.questionText}
Student Answer: ${item.answerText}
Max Marks: ${item.maxMarks}
`).join('\n')}

Return ONLY valid JSON with no markdown formatting:
{
  "results": [
    { "key": "1", "score": 2, "feedback": "Unique, specific feedback for question 1" }
  ]
}`;