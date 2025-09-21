const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
  apiKey: process.env.geminiApiKey || process.env.GEMINI_API_KEY,
});

const CANDIDATE_MODELS = [
  'models/gemini-1.5-flash-002',
  'models/gemini-1.5-flash',
  'models/gemini-1.5-pro-002',
  'models/gemini-1.5-pro'
];

function extractTextFromResult(result) {
  if (!result?.response?.candidates?.[0]?.content?.parts) {
    console.error('Invalid result structure:', JSON.stringify(result, null, 2));
    return null;
  }

  const parts = result.response.candidates[0].content.parts;
  return parts
    .filter(part => part.text)
    .map(part => part.text)
    .join('');
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
      const result = await ai.models.generateContent({
        model,
        config: { systemInstruction },
        contents: [{ role: "user", parts }],
      });

      const text = extractTextFromResult(result);
      if (!text) throw new Error("No valid text response received from Gemini.");
      console.log(`\n✅ Notes generation model used: ${model}\n`);
      return text;
    } catch (err) {
      console.error(`\n❌ Model ${model} failed:`, err.message);
      lastErr = err;
    }
  }

  throw new Error(`All models failed. Last error: ${lastErr?.message || 'Unknown error'}`);
}

module.exports = { generateNotesResponse };