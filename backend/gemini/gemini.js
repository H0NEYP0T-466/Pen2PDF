const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
  apiKey: process.env.geminiApiKey || process.env.GEMINI_API_KEY,
});

const CANDIDATE_MODELS = [
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-1.5-pro-latest",
  "gemini-1.5-pro",
  "gemini-1.5-flash",
];

function extractTextFromResult(result) {
  if (typeof result?.response?.text === "function") return result.response.text();
  if (typeof result?.text === "string") return result.text;

  const t =
    result?.response?.candidates?.[0]?.content?.parts?.find?.(p => p.type === "text")?.text ||
    result?.response?.candidates?.[0]?.content?.parts?.find?.(p => p.text)?.text ||
    null;
  return t;
}

async function generateGeminiResponse(parts) {
  const systemInstruction = `
You are a handwriting-to-digital text converter for an app called Pen2PDF.
Your task:
- Extract readable text from the provided input (notes, slides, scanned PDFs, images).
- Detect possible headings (H1/H2/H3) and preserve formatting.
- Return clean, structured text only, no explanations.
`;

  let lastErr = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const result = await ai.models.generateContent({
        model,
        config: { systemInstruction },
        contents: [{ role: "user", parts }],
      });

      const text = extractTextFromResult(result);
      if (!text) throw new Error("No valid text response received from Gemini.");
      console.log(`\n✅ Model used: ${model}\n`);
      return text;
    } catch (err) {
      lastErr = err;
      const code = err?.status || err?.code;
      const msg = (err?.message || "").toLowerCase();
      const retryable =
        code === 404 ||
        msg.includes("not found") ||
        msg.includes("unsupported") ||
        msg.includes("does not support");
      console.warn(`Model ${model} failed: ${err?.message}`);
      if (!retryable) break;
    }
  }

  console.error("❌ Gemini API error:", lastErr);
  throw lastErr || new Error("Gemini call failed");
}

module.exports = { generateGeminiResponse };