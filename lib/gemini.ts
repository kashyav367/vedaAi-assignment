export async function callGemini(images: string[], prompt: string): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const freeLlmKey = process.env.FREELLMAPI_KEY || process.env.OPENAI_API_KEY;
  const freeLlmBaseUrl = (process.env.FREELLMAPI_BASE_URL || process.env.OPENAI_BASE_URL || '').replace(/\/$/, '');
  const freeLlmModel = process.env.FREELLMAPI_MODEL || process.env.OPENAI_MODEL || 'auto';

  let lastErr: any = null;

  // 1. Try Gemini Native API if key exists
  if (geminiKey) {
    try {
      return await callGeminiNative(images, prompt, geminiKey);
    } catch (err: any) {
      console.warn('Gemini Native API error/rate-limited:', err?.message || err);
      lastErr = err;
    }
  }

  // 2. Failover to FREELLMAPI / OpenAI-Compatible Endpoint if key exists
  if (freeLlmKey && !freeLlmKey.includes('your_') && freeLlmBaseUrl) {
    try {
      return await callOpenAICompatible(images, prompt, freeLlmKey, freeLlmBaseUrl, freeLlmModel);
    } catch (err: any) {
      console.warn('FREELLMAPI / OpenAI Compatible API error:', err?.message || err);
      lastErr = err;
    }
  }

  throw lastErr || new Error('All AI providers rate-limited or unavailable. Please check your GEMINI_API_KEY in .env.local');
}

async function callGeminiNative(images: string[], prompt: string, apiKey: string): Promise<string> {
  const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  const candidateModels = Array.from(new Set([primaryModel, 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash']));

  const parts: any[] = [{ text: prompt }];
  images.forEach((img) => {
    parts.push({ inline_data: { mime_type: 'image/png', data: img } });
  });

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
          }),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        lastError = new Error(`Gemini (${model}) status ${res.status}: ${errText.slice(0, 100)}`);
        continue;
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error('Gemini 429 Rate Limit: Free tier daily quota limit reached.');
}

async function callOpenAICompatible(
  images: string[],
  prompt: string,
  apiKey: string,
  baseUrl: string,
  modelName: string
): Promise<string> {
  const contentParts: any[] = [{ type: 'text', text: prompt }];

  images.forEach((img) => {
    const dataUrl = img.startsWith('data:') ? img : `data:image/png;base64,${img}`;
    contentParts.push({
      type: 'image_url',
      image_url: { url: dataUrl },
    });
  });

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        {
          role: 'user',
          content: contentParts,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI Compatible API error ${res.status}: ${errText.slice(0, 150)}`);
  }

  const data = await res.json();
  const messageContent = data?.choices?.[0]?.message?.content;

  if (!messageContent) {
    throw new Error('No content returned from OpenAI Compatible endpoint');
  }

  return messageContent;
}

export function parseGeminiJson<T = any>(text: string): T {
  if (!text) throw new Error('Empty response string');

  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?/gi, '').replace(/```$/gi, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (_) {}

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace > firstBrace) {
    let candidate = cleaned.substring(firstBrace, lastBrace + 1);
    candidate = candidate.replace(/,\s*([}\]])/g, '$1');

    try {
      return JSON.parse(candidate);
    } catch (_) {}

    const match = candidate.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (_) {}
    }
  }

  throw new Error(`Failed to parse JSON response from LLM`);
}