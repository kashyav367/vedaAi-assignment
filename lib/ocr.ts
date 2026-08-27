import path from 'path';

export async function performOcrOnImage(base64Image: string): Promise<string> {
  try {
    const { createWorker } = await import('tesseract.js');
    const buffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const workerPath = path.join(process.cwd(), 'node_modules', 'tesseract.js', 'src', 'worker-script', 'node', 'index.js');
    const worker = await createWorker('eng', 1, { workerPath });
    const ret = await worker.recognize(buffer);
    await worker.terminate();
    return ret.data.text || '';
  } catch (err: any) {
    console.warn('OCR fallback skipped:', err?.message || err);
    return '';
  }
}
