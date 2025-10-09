const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
  apiKey: process.env.geminiApiKey || process.env.GEMINI_API_KEY,
});

// Text extraction priority: 2.5 flash -> 2.5 pro -> 2.0 flash -> rest
const CANDIDATE_MODELS = [
  "gemini-2.5-flash-latest",
  "gemini-2.5-pro-latest",
  "gemini-2.5-flash-002",
  "gemini-2.5-pro-002",
  "gemini-2.0-flash-exp",
  "gemini-2.0-flash-lite"
];

async function generateGeminiResponse(parts) {
  const systemInstruction = `
You are a handwriting-to-digital text converter for an app called Pen2PDF.
Your task:
- Extract readable text from the provided input (notes, slides, scanned PDFs, images).
- Detect possible headings (H1/H2/H3) and preserve formatting.
- Return clean, structured text only, no explanations.
`;

  console.log('🔄 [GEMINI TEXT] Starting text extraction with model fallback strategy');
  console.log('📋 [GEMINI TEXT] System instruction:', systemInstruction.trim());

  let lastErr = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      console.log(`\n🔄 [GEMINI TEXT] Trying model: ${model}`);
      console.log(`📤 [GEMINI TEXT] Sending request to Gemini API...`);
      
      const response = await ai.models.generateContent({
        model,
        contents: parts,
        config: { systemInstruction }
      });

      console.log('📦 [GEMINI TEXT] Full API response received:');
      console.log('─'.repeat(80));
      console.log(JSON.stringify(response, null, 2));
      console.log('─'.repeat(80));

      const text = response.text;
      if (!text || text.trim().length === 0) {
        throw new Error("No valid text response received from Gemini.");
      }
      
      console.log(`\n✅ [GEMINI TEXT] Text extraction successful using model: ${model}`);
      console.log(`📊 [GEMINI TEXT] Extracted text length: ${text.length} characters`);
      console.log('📝 [GEMINI TEXT] Extracted text content:');
      console.log('─'.repeat(80));
      console.log(text);
      console.log('─'.repeat(80));
      
      return text;
    } catch (err) {
      lastErr = err;
      const code = err?.status || err?.code;
      const msg = (err?.message || "").toLowerCase();
      
      console.error(`❌ [GEMINI TEXT] Model ${model} failed:`, {
        message: err?.message,
        status: code,
        stack: err?.stack
      });
      
      const isRateLimit = code === 429 || msg.includes("quota") || msg.includes("rate limit");
      
      const isServiceUnavailable = code === 503 || msg.includes("overloaded") || msg.includes("unavailable");
      
      const isRetryable =
        code === 404 ||
        msg.includes("not found") ||
        msg.includes("unsupported") ||
        msg.includes("does not support") ||
        msg.includes("text parameter") ||
        isRateLimit ||
        isServiceUnavailable;
        
      if (isRateLimit) {
        console.log(`⏳ [GEMINI TEXT] Rate limit hit for ${model}, trying next model...`);
      } else if (isServiceUnavailable) {
        console.log(`⚠️ [GEMINI TEXT] Model ${model} is overloaded/unavailable, trying next model...`);
      } else if (!isRetryable) {
        console.log(`❌ [GEMINI TEXT] Non-retryable error for ${model}, stopping attempts.`);
        break;
      }
    }
  }

  console.error("❌ [GEMINI TEXT] All models failed. Last error:", lastErr);
  throw lastErr || new Error("Gemini call failed");
}

module.exports = { generateGeminiResponse };