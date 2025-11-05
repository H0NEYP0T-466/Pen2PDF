const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
  apiKey: process.env.geminiApiKey || process.env.GEMINI_API_KEY,
});


const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.5-pro";

/**
 * Centralized helper function to call Gemini API with fallback logic
 * @param {string} primaryModel - Primary model to try first
 * @param {string} fallbackModel - Fallback model if primary fails
 * @param {Array} parts - Content parts to send to the model
 * @param {string} systemInstruction - System instruction for the model
 * @param {string} logPrefix - Prefix for console logs (e.g., "[GEMINI TEXT]")
 * @returns {Promise<string>} - Response text from the model
 */
async function callGeminiAPI(primaryModel, fallbackModel, parts, systemInstruction, logPrefix) {
  const models = [primaryModel, fallbackModel];
  let lastErr = null;

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    const isPrimary = i === 0;
    
    try {
      console.log(`\n🔄 ${logPrefix} Attempting ${model}...`);
      console.log(`📤 ${logPrefix} Sending request to Gemini API...`);
      
      const response = await ai.models.generateContent({
        model,
        contents: parts,
        config: { systemInstruction }
      });

      console.log(`📦 ${logPrefix} Full API response received:`);
      console.log('─'.repeat(80));
      console.log(JSON.stringify(response, null, 2));
      console.log('─'.repeat(80));

      const text = response.text;
      if (!text || text.trim().length === 0) {
        throw new Error("No valid text response received from Gemini.");
      }
      
      console.log(`\n✅ ${logPrefix} ${model} responded successfully.`);
      console.log(`📊 ${logPrefix} Response length: ${text.length} characters`);
      console.log(`📝 ${logPrefix} Response content:`);
      console.log('─'.repeat(80));
      console.log(text);
      console.log('─'.repeat(80));
      
      return text;
    } catch (err) {
      lastErr = err;
      const code = err?.status || err?.code;
      const msg = (err?.message || "").toLowerCase();
      
      console.error(`❌ ${logPrefix} Model ${model} failed:`, {
        message: err?.message,
        status: code,
        stack: err?.stack
      });
      
      // Check for retryable errors
      const isQuotaError = code === 429 || msg.includes("quota") || msg.includes("rate limit");
      const isNotFound = code === 404 || msg.includes("not found");
      const isForbidden = code === 403;
      const isServiceUnavailable = code === 503 || msg.includes("overloaded") || msg.includes("unavailable");
      
      const isRetryable = isQuotaError || isNotFound || isForbidden || isServiceUnavailable;
      
      if (isRetryable && !isPrimary) {
        // Already on fallback, no more models to try
        console.error(`❌ ${logPrefix} Fallback model also failed. No more models to try.`);
        break;
      } else if (isRetryable && isPrimary) {
        // Try fallback
        if (isQuotaError) {
          console.log(`⏳ ${logPrefix} Model ${model} quota reached or unavailable, retrying ${fallbackModel}...`);
        } else if (isForbidden) {
          console.log(`🚫 ${logPrefix} Model ${model} access forbidden (403), retrying ${fallbackModel}...`);
        } else if (isNotFound) {
          console.log(`🔍 ${logPrefix} Model ${model} not found (404), retrying ${fallbackModel}...`);
        } else if (isServiceUnavailable) {
          console.log(`⚠️ ${logPrefix} Model ${model} service unavailable (503), retrying ${fallbackModel}...`);
        }
        continue;
      } else {
        // Non-retryable error
        console.log(`❌ ${logPrefix} Non-retryable error for ${model}, stopping attempts.`);
        break;
      }
    }
  }

  console.error(`❌ ${logPrefix} All models failed. Last error:`, lastErr);
  throw lastErr || new Error("Gemini API call failed");
}

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
  console.log(`📊 [GEMINI TEXT] Primary model: ${PRIMARY_MODEL}, Fallback: ${FALLBACK_MODEL}`);

  return await callGeminiAPI(PRIMARY_MODEL, FALLBACK_MODEL, parts, systemInstruction, '[GEMINI TEXT]');
}

module.exports = { generateGeminiResponse, callGeminiAPI };