const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const matchKey = envFile.match(/FREELLMAPI_KEY=(.+)/) || envFile.match(/GROQ_API_KEY=(.+)/) || envFile.match(/OPENAI_API_KEY=(.+)/);
const key = matchKey ? matchKey[1].trim() : '';

const baseUrl = process.env.FREELLMAPI_BASE_URL || 'https://freellmapi.co/v1';

console.log('Testing OpenAI-compatible endpoint:', baseUrl);
console.log('Key available:', !!key);
