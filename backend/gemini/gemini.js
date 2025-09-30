const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
  apiKey: process.env.geminiApiKey || process.env.GEMINI_API_KEY,
});

const CANDIDATE_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.5-pro",
  "gemini-1.5-flash",
  "gemini-1.5-pro"
];

function extractTextFromResult(result) {
  if (typeof result?.response?.text === "function") return result.response.text();
  if (typeof result?.text === "string") return result.text;

  const t =
    result?.response?.candidates?.[0]?.content?.parts?.find?.(p => p.type === "text")?.text ||
    result?.response?.candidates?.[0]?.content?.parts?.find?.(p => p.text)?.text ||
    result?.candidates?.[0]?.content?.parts?.find?.(p => p.type === "text")?.text ||
    result?.candidates?.[0]?.content?.parts?.find?.(p => p.text)?.text ||
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
      console.log(`\n🔄 Trying model: ${model}`);
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
      
      // Check for rate limit errors
      const isRateLimit = code === 429 || msg.includes("quota") || msg.includes("rate limit");
      
      // Check for service unavailable/overloaded errors
      const isServiceUnavailable = code === 503 || msg.includes("overloaded") || msg.includes("unavailable");
      
      // Check for retryable errors
      const isRetryable =
        code === 404 ||
        msg.includes("not found") ||
        msg.includes("unsupported") ||
        msg.includes("does not support") ||
        msg.includes("text parameter") ||
        isRateLimit ||
        isServiceUnavailable;
        
      console.warn(`❌ Model ${model} failed: ${err?.message}`);
      
      if (isRateLimit) {
        console.log(`⏳ Rate limit hit for ${model}, trying next model...`);
      } else if (isServiceUnavailable) {
        console.log(`⚠️ Model ${model} is overloaded/unavailable, trying next model...`);
      } else if (!isRetryable) {
        console.log(`❌ Non-retryable error for ${model}, stopping attempts.`);
        break;
      }
    }
  }

  console.error("❌ Gemini API error:", lastErr);
  throw lastErr || new Error("Gemini call failed");
}

module.exports = { generateGeminiResponse };