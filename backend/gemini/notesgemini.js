const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
  apiKey: process.env.geminiApiKey || process.env.GEMINI_API_KEY,
});

const CANDIDATE_MODELS = [
  "gemini-2.0-flash-exp",
  "gemini-1.5-flash-002",
  "gemini-1.5-flash-001",
  "gemini-1.5-pro-002",
  "gemini-1.5-pro-001"
];

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
* ## ➕ Formulas/Definitions (if applicable - use LaTeX format)
* ## ⚙️ Procedures/Algorithms (if applicable - numbered steps)
* ## 💡 Examples (if applicable)
* ## ❓ Questions for Review — ⭐ MANDATORY (3-9 questions)
* ## ✅ Answers — ⭐ MANDATORY (brief answers to all questions)
* ## 🍼 Teach It Simply — ⭐ MANDATORY LAST SECTION (child-friendly explanations with 2-5 real-world analogies)

## 🎯 Rules
* Your **goal is NOT to make the notes long** — focus on delivering *concise, clear study notes only*.
* Discard any unnecessary or irrelevant material from the provided source.
* **Make the notes exam-focused:** after the heading of a topic, if the topic is especially important for exams, add **(IMP*)** right after the heading.
* Use H1/H2/H3 headings only.
* **All headings and bullet points must include relevant emojis**
* Bold key terms on first mention
* Academic tone (except "Teach It Simply" section)
* Include inline source citations: (slide#X) or (page#X)
* No invented facts — use only content from provided files.

## 📐 LaTeX Formatting Rules (CRITICAL for Formulas/Definitions section)
* **ALWAYS use proper LaTeX delimiters:**
  - For inline math: Use single dollar signs like \`$formula$\`
  - For display/block math: Use double dollar signs like \`$$formula$$\`
* **Examples of CORRECT LaTeX formatting:**
  - Inline: \`$s = T(r)$\` or \`$g(x,y) = T[f(x,y)]$\`
  - Display: \`$$s = c \\cdot \\log(1+r)$$\` or \`$$p(r_k) = \\frac{n_k}{MN}$$\`
* **Use proper LaTeX syntax:**
  - Multiplication: Use \`\\cdot\` for dot product (e.g., \`$c \\cdot r$\`)
  - Fractions: Use \`\\frac{numerator}{denominator}\` (e.g., \`$\\frac{a}{b}$\`)
  - Superscripts: Use \`^\` for powers (e.g., \`$r^\\gamma$\`)
  - Subscripts: Use \`_\` for subscripts (e.g., \`$r_k$\`)
  - Greek letters: Use backslash (e.g., \`$\\gamma$\`, \`$\\theta$\`, \`$\\alpha$\`)
  - Integrals: Use \`\\int\` (e.g., \`$\\int_0^r f(x)dx$\`)
  - Summations: Use \`\\sum\` (e.g., \`$\\sum_{i=1}^{n} x_i$\`)
* **NEVER write formulas as plain text** - always wrap them in LaTeX delimiters
* **Each formula MUST be complete and valid LaTeX** - test mentally if it would render correctly

${retryInstruction ? `\n\nAdditional instruction: ${retryInstruction}` : ''}
`;

  console.log('🔄 [GEMINI NOTES] Starting notes generation with model fallback strategy');
  console.log('📋 [GEMINI NOTES] System instruction:', systemInstruction.substring(0, 200) + '...');

  let lastErr = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      console.log(`\n🔄 [GEMINI NOTES] Trying model: ${model}`);
      console.log(`📤 [GEMINI NOTES] Sending request to Gemini API...`);
      
      const response = await ai.models.generateContent({
        model,
        contents: parts,
        config: { systemInstruction }
      });

      console.log('📦 [GEMINI NOTES] Full API response received:');
      console.log('─'.repeat(80));
      console.log(JSON.stringify(response, null, 2));
      console.log('─'.repeat(80));

      const text = response.text;
      if (!text || text.trim().length === 0) {
        throw new Error("No valid text response received from Gemini.");
      }
      
      console.log(`\n✅ [GEMINI NOTES] Notes generation successful using model: ${model}`);
      console.log(`📊 [GEMINI NOTES] Generated content length: ${text.length} characters`);
      console.log('📝 [GEMINI NOTES] Generated notes content:');
      console.log('─'.repeat(80));
      console.log(text);
      console.log('─'.repeat(80));
      
      return { text, modelUsed: model };
    } catch (err) {
      console.error(`\n❌ [GEMINI NOTES] Model ${model} failed:`, {
        message: err?.message,
        status: err?.status || err?.code,
        stack: err?.stack
      });
      lastErr = err;
      
      const code = err?.status || err?.code;
      const msg = (err?.message || "").toLowerCase();
      
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
        console.log(`⏳ [GEMINI NOTES] Rate limit hit for ${model}, trying next model...`);
      } else if (isServiceUnavailable) {
        console.log(`⚠️ [GEMINI NOTES] Model ${model} is overloaded/unavailable, trying next model...`);
      } else if (!isRetryable) {
        console.log(`❌ [GEMINI NOTES] Non-retryable error for ${model}, stopping attempts.`);
        break;
      }
    }
  }

  throw new Error(`All models failed. Last error: ${lastErr?.message || 'Unknown error'}`);
}

module.exports = { generateNotesResponse };