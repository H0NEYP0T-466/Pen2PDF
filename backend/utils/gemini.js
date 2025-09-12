// geminiClient.js
const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');
dotenv.config();

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_APIKEY,
});

// SYSTEM_PROMPT must be defined here, outside the function
const SYSTEM_PROMPT = `
You are a handwriting-to-digital text converter for an app called Pen2PDF.
Your tasks:
- Extract readable text from the provided input (notes, slides, scanned PDFs, images).
- Ignore spelling mistakes and preserve what was actually written.
- Detect possible headings:
  - H1 = big/main heading
  - H2 = sub-heading
  - H3 = emphasized/bold text
- Return clean, structured text only (no explanations or commentary).
Extract every word; just return the text format.
`;

async function processContentWithGemini(content, mimeType = null) {
  try {
    let input;
    if (mimeType && mimeType.startsWith('image/')) {
      input = [
        { text: SYSTEM_PROMPT },
        { inlineData: { data: content, mimeType } },
      ];
    } else {
      input = [
        { text: SYSTEM_PROMPT },
        { text: content },
      ];
    }

    const result = await genAI.responses.create({
      model: 'gemini-2.5-flash',
      input,
    });

    return result?.output?.[0]?.content?.[0]?.text || '';
  } catch (err) {
    console.error('Gemini API error:', err);
    throw new Error(`Failed to process content with Gemini: ${err.message}`);
  }
}

module.exports = { processContentWithGemini };
