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
  // Try multiple extraction methods to handle different response structures
  
  // Method 1: Check if result has a text() function (some versions)
  if (typeof result?.response?.text === "function") return result.response.text();
  if (typeof result?.text === "string") return result.text;
  
  // Method 2: Try direct candidates structure (newer API)
  if (result?.candidates?.[0]?.content?.parts) {
    const parts = result.candidates[0].content.parts;
    const text = parts
      .filter(part => part.text)
      .map(part => part.text)
      .join('');
    if (text) return text;
  }
  
  // Method 3: Try response.candidates structure (older API)
  if (result?.response?.candidates?.[0]?.content?.parts) {
    const parts = result.response.candidates[0].content.parts;
    const text = parts
      .filter(part => part.text)
      .map(part => part.text)
      .join('');
    if (text) return text;
  }
  
  // Method 4: Try alternative extraction methods
  const t =
    result?.response?.candidates?.[0]?.content?.parts?.find?.(p => p.type === "text")?.text ||
    result?.response?.candidates?.[0]?.content?.parts?.find?.(p => p.text)?.text ||
    result?.candidates?.[0]?.content?.parts?.find?.(p => p.type === "text")?.text ||
    result?.candidates?.[0]?.content?.parts?.find?.(p => p.text)?.text ||
    null;
  
  if (!t) {
    console.error('Invalid result structure - no text found:', JSON.stringify(result, null, 2));
    return null;
  }
  
  return t;
}

async function generateNotesResponse(parts, retryInstruction = null) {
  const systemInstruction = `
# 📘 Study Notes Generator

Transform provided files into clean, structured study notes using **Markdown only**.

## 🏗️ Structure
Include sections only if relevant from source content, except mandatory sections marked with ⭐:

* # 📑 Title (infer from content)
* ## 🌐 Overview (3-6 sentences)
* ## ⭐ Key Takeaways (5-10 bullets)
* ## 📂 Concepts (organize by topic with inline citations like (page#X))
* ## ➕ Formulas/Definitions (if applicable - use LaTeX)
* ## ⚙️ Procedures/Algorithms (if applicable - numbered steps)
* ## 💡 Examples (if applicable)
* ## ❓ Questions for Review — ⭐ MANDATORY (3-9 questions)
* ## ✅ Answers — ⭐ MANDATORY (brief answers to all questions)
* ## 🍼 Teach It Simply — ⭐ MANDATORY LAST SECTION (child-friendly explanations with 2-5 real-world analogies)

## 🎯 Rules
* Use H1/H2/H3 headings only
* **All headings and bullet points must include relevant emojis**
* Bold key terms on first mention
* Academic tone (except "Teach It Simply" section)
* Include inline source citations: (slide#X) or (page#X)
* No invented facts - only content from provided files

${retryInstruction ? `\n\nAdditional instruction: ${retryInstruction}` : ''}
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
      console.log(`\n✅ Notes generation model used: ${model}\n`);
      return { text, modelUsed: model };
    } catch (err) {
      console.error(`\n❌ Model ${model} failed:`, err.message);
      lastErr = err;
      
      const code = err?.status || err?.code;
      const msg = (err?.message || "").toLowerCase();
      
      // Check for rate limit errors
      const isRateLimit = code === 429 || msg.includes("quota") || msg.includes("rate limit");
      
      // Check for retryable errors (model not available, unsupported, etc.)
      const isRetryable = 
        code === 404 ||
        msg.includes("not found") ||
        msg.includes("unsupported") ||
        msg.includes("does not support") ||
        msg.includes("text parameter") ||
        isRateLimit;
      
      if (isRateLimit) {
        console.log(`⏳ Rate limit hit for ${model}, trying next model...`);
      } else if (!isRetryable) {
        console.log(`❌ Non-retryable error for ${model}, stopping attempts.`);
        break;
      }
    }
  }

  throw new Error(`All models failed. Last error: ${lastErr?.message || 'Unknown error'}`);
}

module.exports = { generateNotesResponse };