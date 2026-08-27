const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const match = envFile.match(/GEMINI_API_KEY=(.+)/);
const apiKey = match ? match[1].trim() : '';

async function callGeminiWithRetry(prompt, attempt = 1) {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );

    if (!res.ok) {
      if (res.status === 429 && attempt <= 4) {
        const waitMs = attempt * 2000;
        console.warn(`429 Rate limit on attempt ${attempt}. Waiting ${waitMs}ms...`);
        await new Promise((r) => setTimeout(r, waitMs));
        return callGeminiWithRetry(prompt, attempt + 1);
      }
      throw new Error(`API Error ${res.status}`);
    }

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (e) {
    if (attempt <= 4) {
      await new Promise((r) => setTimeout(r, 2000));
      return callGeminiWithRetry(prompt, attempt + 1);
    }
    throw e;
  }
}

async function testBatch() {
  console.log('Testing 12 sequential/batched API requests with retry backoff...');
  for (let i = 1; i <= 12; i++) {
    console.log(`Sending page ${i}...`);
    try {
      const res = await callGeminiWithRetry(`Page ${i}: extract answer for Q${i}. Return JSON {"status": "ok", "q": "${i}"}`);
      console.log(`Page ${i} SUCCESS:`, res.trim().slice(0, 40));
    } catch (e) {
      console.error(`Page ${i} FAILED:`, e.message);
    }
    await new Promise((r) => setTimeout(r, 500));
  }
}

testBatch().catch(console.error);
