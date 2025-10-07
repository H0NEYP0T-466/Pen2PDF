const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
  apiKey: process.env.geminiApiKey || process.env.GEMINI_API_KEY,
});

const CANDIDATE_MODELS = [
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.0-flash", 
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
      
      // Check for service unavailable/overloaded errors
      const isServiceUnavailable = code === 503 || msg.includes("overloaded") || msg.includes("unavailable");
      
      // Check for retryable errors (model not available, unsupported, etc.)
      const isRetryable = 
        code === 404 ||
        msg.includes("not found") ||
        msg.includes("unsupported") ||
        msg.includes("does not support") ||
        msg.includes("text parameter") ||
        isRateLimit ||
        isServiceUnavailable;
      
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

  throw new Error(`All models failed. Last error: ${lastErr?.message || 'Unknown error'}`);
}

module.exports = { generateNotesResponse };