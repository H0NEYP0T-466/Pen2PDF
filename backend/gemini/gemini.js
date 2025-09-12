const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();


const ai = new GoogleGenAI({
    apiKey: process.env.geminiApiKey,
});

async function generateGeminiResponse(userPrompt) {
  try {
    const systemInstruction = `
You are a handwriting-to-digital text converter for an app called Pen2PDF.
Your tasks:
- Extract readable text from the provided input (notes, slides, scanned PDFs, images).
- Ignore spelling mistakes and preserve what was actually written.
- Detect possible headings:
  - H1 = big/main heading
  - H2 = sub-heading
  - H3 = emphasized/bold text
- Return clean, structured text only (no explanations or commentary).
extract every word from this i just need this in text format nothing else
`;

   const result = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemInstruction
      },
      contents: [
        { role: "user", parts: [{ text: userPrompt }] }
      ],
    });

    const text =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      result.text ||
      null;

    if (!text) throw new Error("No valid text response received from Gemini.");
   console.log("\n💬 Gemini's Response:\n", text, "\n");
    return text;
  } catch (err) {
    console.error("❌ Gemini API error:", err);
    return "Error generating response.";
  }
}

module.exports = generateGeminiResponse;
