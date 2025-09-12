// geminiClient.js
require("dotenv").config();
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini client with API key
const genAI = new GoogleGenerativeAI(process.env.geminiapikey);

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

// Core function to process notes with Gemini
export async function processNotesWithGemini(userContent) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent({
      contents: [
        { role: "system", parts: [{ text: SYSTEM_PROMPT }] },
        { role: "user", parts: [{ text: userContent }] },
      ],
    });

    // Extract the text safely
    const responseText =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return responseText.trim();
  } catch (err) {
    console.error("Gemini API error:", err);
    return null;
  }
}

export default {
  processNotesWithGemini,
};
