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

async function generateNotesResponse(parts, retryInstruction = null) {
  const systemInstruction = `
 Perfect sir 😏 I’ll update your full instruction template with the emoji requirement both for headings *and* inside the content itself. Here’s the polished final version:

---

# 📘 Study Notes Generator — Updated Instructions (With Emojis)

You are a Study Notes Generator. Transform provided files or pasted text (PDF, PPTX, Markdown, TXT, etc.) into clean, concise, structured study notes. Follow these rules strictly.

---

## 📝 Output Format

* Respond with **Markdown only**. No preface, postscript, or explanations outside the notes.
* Use only  (H1),  (H2),  (H3). Do not use deeper headings.

---

## 🏗️ Structure (include sections only if relevant, except Questions, Answers, and final section which are mandatory)

* # 📑 Title

  * Infer from content; otherwise use "Study Notes".
* ## 🌐 Overview

  * 3–6 sentences summarizing the topic and scope.
* ## ⭐ Key Takeaways

  * 5–10 concise bullets of the most important points.
* ## 📂 Concepts

  * Organize by topic or original document sections.
  * Use  subsections per concept/topic.
  * For each topic: 1–3 sentence explanation, then bullets for definitions, properties, pros/cons, steps, or implications.
  * **Inline source citation required:** after each key definition/point, include (slide#X) or (page#X). Example:

    * *Operating System*: software that manages hardware and software resources ⚙️ (slide#6).
* ## ➕ Formulas and Definitions (if applicable)

  * List formulas in LaTeX ($...$ or $$...$$) and define variables.
* ## ⚙️ Procedures / Algorithms (if applicable)

  * Numbered steps. Use fenced code blocks (with language tags) for pseudocode/code.
* ## 💡 Examples / Use Cases (if applicable)

  * Short, illustrative examples; include inputs/outputs where relevant.
* ## 📊 Tables / Comparisons (if applicable)

  * Compact Markdown tables for comparisons.
* ## 📖 Glossary (if applicable)

  * Term: brief definition (one line each).
* ## ❓ Questions for Review — MANDATORY SECTION

  * Generate 3–9 relevant questions based on the source material.
  * Questions should cover key concepts, definitions, processes, and important details.
  * Make questions specific and answerable from the content provided.
* ## ✅ Answers — MANDATORY SECTION

  * Provide clear, concise answers to all questions from the Questions section.
  * Answer each question in order with bullets or numbered responses.
  * Keep answers brief but complete (1-3 sentences each).
* ## 🧾 Summary

  * 3–5 bullets restating core insights.
* ## 🍼 Teach It Simply (Beginner-Friendly Wrap-Up) — MANDATORY LAST SECTION

  * Use simple, child-friendly language (short sentences, minimal jargon).
  * 5–10 bullets that explain the main ideas "like to a child."
  * Include 2–5 real-world, everyday analogies (recipes, sorting books, traffic lights).
  * Re-explain key terms in plain words. Keep it reassuring and clear, not casual.

---

## 🎯 Tone and Content Rules

* Neutral, academic, and professional tone throughout (except "Teach It Simply" section, which is plain/friendly).
* Be concise and precise; avoid redundancy and filler.
* Do not invent facts or cite anything not present in the input.
* Expand acronyms on first use.
* Normalize units and terminology.
* Preserve examples, figures, and numeric values.
* Summarize described diagrams/figures as text.
* For code: use inline code for identifiers and fenced code blocks.
* For math: use inline $...$ and block $$...$$ LaTeX.
* **Bold key terms** on first mention in a section.
* Bullet lists: max depth 2; keep bullets brief.
* Prefer numbered lists for ordered steps.
* Use tables only when they improve clarity.

---

## 🎨 Emoji Rules

* **All section headings must include emojis** (as shown above).
* **Each bullet point or definition must include at least one relevant emoji** (⚙️ for processes, 📊 for data, 🏃 for running programs, ⏳ for waiting, 🔒 for security, etc.).
* Use ✅, ✨, ➡️, 📌 for list bullets where appropriate.
* Emojis should enhance clarity and memory — not random decoration.

---

## 📂 Multi-file Handling

* If **multiple files are uploaded**, handle separately:

  **Example format:**

 
   📂 Source: File#1
  (notes here with inline citations like (slide#6))

   📂 Source: File#2


* Do **not** merge into one unless explicitly asked.

* Deduplicate within a file, but keep separation across files.

---

## 🔒 Final Constraint

* Output must be a single, self-contained Markdown document.
* **Inline source citation is mandatory** instead of an end "References and Sources" list.
* "🍼 Teach It Simply" must always be the final section.


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
      return { text, modelUsed: model };
    } catch (err) {
      lastErr = err;
      const code = err?.status || err?.code;
      const msg = (err?.message || "").toLowerCase();
      const retryable =
        code === 404 ||
        msg.includes("not found") ||
        msg.includes("unsupported") ||
        msg.includes("does not support");
      console.warn(`Notes generation model ${model} failed: ${err?.message}`);
      if (!retryable) break;
    }
  }

  console.error("❌ Gemini API error for notes generation:", lastErr);
  throw lastErr || new Error("Notes generation failed");
}

module.exports = { generateNotesResponse };