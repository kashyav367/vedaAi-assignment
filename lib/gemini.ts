export async function callGemini(images: string[], prompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";

    const parts: any[]= [{ text: prompt}];
    images.forEach((img) => {
        parts.push({ inline_data: {mime_type: 'image/png', data: img} });
    });

    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        contents: [{parts}],
                        generationConfig: { responseMimeType: 'application/json' },
                    })
                }
            );

            if (!res.ok) {
                const errText = await res.text();
                if (res.status === 429 && attempt < maxRetries) {
                    let waitSec = Math.min(attempt * 3, 5);
                    console.warn(`Gemini API 429 rate limit. Retrying in ${waitSec}s (attempt ${attempt}/${maxRetries})...`);
                    await new Promise((r) => setTimeout(r, waitSec * 1000));
                    continue;
                }
                if (res.status === 429) {
                  throw new Error(`Gemini 429 Rate Limit: Free tier daily quota limit (20 requests/day) reached.`);
                }
                throw new Error(`Gemini API error: ${res.status}`);
            }

            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                throw new Error('No text in Gemini response');
            }
            return text;
        } catch (err: any) {
            lastError = err;
            if (attempt < maxRetries && !err.message?.includes('429')) {
                await new Promise((r) => setTimeout(r, 2000));
                continue;
            }
            throw err;
        }
    }
    throw lastError || new Error('Gemini API call failed after retries');
}

export function parseGeminiJson<T = any>(text: string): T {
    let cleaned = text.trim();
    cleaned = cleaned.replace(/^```(?:json)?/gi, '').replace(/```$/gi, '').trim();
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    return JSON.parse(cleaned);
}

