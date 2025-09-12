const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();


const ai = new GoogleGenAI({
    apiKey: process.env.geminiApiKey,
});

async function generateGeminiResponse(userPrompt) {
  try {
    const systemInstruction = `You are a helpful assistant. Respond to the user's query based on the conversation history.
`;

   const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
   console.log("\n💬 Isabella's Response:\n", text, "\n");
    return text;
  } catch (err) {
    console.error("❌ Gemini API error:", err);
    return "Error generating response.";
  }
}

module.exports = generateGeminiResponse;
