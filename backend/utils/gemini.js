// geminiClient.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_APIKEY);

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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt;
    if (mimeType && mimeType.startsWith('image/')) {
      prompt = [
        SYSTEM_PROMPT,
        {
          inlineData: {
            data: content,
            mimeType: mimeType
          }
        }
      ];
    } else {
      prompt = `${SYSTEM_PROMPT}\n\nText to process:\n${content}`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text || '';
  } catch (err) {
    console.error('Gemini API error:', err);
    throw new Error(`Failed to process content with Gemini: ${err.message}`);
  }
}

module.exports = { processContentWithGemini };
