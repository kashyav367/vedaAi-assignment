'use client';

export async function pdfToImages(
  file: File,
  includeYCoords: boolean = true
): Promise<{ images: string[]; pdfText: string }> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const images: string[] = [];
  const textPieces: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    images.push(canvas.toDataURL('image/png').split(',')[1]);

    try {
      const textContent = await page.getTextContent();
      const pdfHeight = page.getViewport({ scale: 1 }).height;
      // Build text with real line breaks and exact Y coordinates if requested
      let lastY: number | null = null;
      const lineChunks: string[] = [];
      let isNewLine = true;

      for (const item of textContent.items as any[]) {
        if (!item.str || item.str.trim().length === 0) continue;
        const itemY = item.transform ? item.transform[5] : null;

        if (lastY !== null && itemY !== null && Math.abs(itemY - lastY) > 2) {
          // Y position changed significantly → new line
          lineChunks.push('\n');
          isNewLine = true;
        }

        if (isNewLine && includeYCoords && itemY !== null) {
          // Calculate Y percentage from top of page
          const yPercent = ((pdfHeight - itemY) / pdfHeight) * 100;
          lineChunks.push(`[Y:${yPercent.toFixed(2)}] `);
          isNewLine = false;
        }

        lineChunks.push(item.str);
        if (itemY !== null) lastY = itemY;
      }
      const pageText = lineChunks.join(' ').replace(/ *\n */g, '\n').trim();
      if (pageText.trim()) {
        textPieces.push(`--- PAGE ${i} ---\n${pageText}`);
      }
    } catch (_) {}
  }

  return { images, pdfText: textPieces.join('\n\n') };
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}