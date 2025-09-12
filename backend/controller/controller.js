const generateGeminiResponse = require('../gemini/gemini');


const generateRES = async (req, res) => {
  try {
    console.log('Received request at /textExtract');
    
    const prompt = req.body.prompt;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const reply = await generateGeminiResponse(prompt);

    res.json({ text: reply });
  } catch (err) {
    console.error("❌ Error in /textExtract route:", err.message);
    res.status(500).json({ error: "Something went wrong with text extraction." });
  }
};

module.exports = { generateRES };
