const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const match = envFile.match(/GEMINI_API_KEY=(.+)/);
const apiKey = match ? match[1].trim() : '';

const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-3.6-flash'];

async function testModel(model) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Hello, respond with JSON {"status": "ok"}' }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    const data = await res.json();
    if (res.ok) {
      console.log(`[SUCCESS] ${model}:`, data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim());
    } else {
      console.log(`[FAILED] ${model} (${res.status}):`, data?.error?.message);
    }
  } catch (e) {
    console.log(`[ERROR] ${model}:`, e.message);
  }
}

async function run() {
  for (const m of models) {
    await testModel(m);
  }
}

run();
