// geminiClient.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini client with API key from Vite environment variables
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// System prompt (context for Gemini)
const SYSTEM_PROMPT = `
You are a handwriting-to-digital text converter for an app called Pen2PDF.
Your tasks:
- Extract readable text from the provided input (notes, slides, scanned PDFs, images).
- Ignore spelling mistakes and instead preserve what was actually written.
- Detect possible headings:
  - H1 = big/main heading
  - H2 = sub-heading
  - H3 = emphasized/bold text
- Return clean, structured text only (no explanations or commentary).
extract every word from this i just need this in text format nothing else
`;

// Core function to process content with Gemini (supports text and images)
export async function processContentWithGemini(content, mimeType = null) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let input;
    if (mimeType && mimeType.startsWith('image/')) {
      // For images, send as multimodal input
      input = [
        { text: SYSTEM_PROMPT },
        {
          inlineData: {
            data: content, // base64 string
            mimeType: mimeType
          }
        }
      ];
    } else {
      // For text content
      input = [
        { text: SYSTEM_PROMPT },
        { text: content }
      ];
    }

    const result = await model.generateContent(input);

    // Extract the text safely
    const responseText = result?.response?.text() || "";

    return responseText.trim();
  } catch (err) {
    console.error("Gemini API error:", err);
    throw new Error(`Failed to process content with Gemini: ${err.message}`);
  }
}

export default {
  processContentWithGemini,
};
