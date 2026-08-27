const fs = require('fs');
const { createWorker } = require('tesseract.js');

async function testOcr() {
  console.log('Starting Tesseract OCR on test-question-paper.png...');
  const worker = await createWorker('eng');
  const ret = await worker.recognize('test-question-paper.png');
  console.log('--- OCR TEXT FROM QUESTION PAPER ---');
  console.log(ret.data.text);
  await worker.terminate();
}

testOcr().catch(console.error);
