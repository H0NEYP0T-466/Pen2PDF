// index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const { processContentWithGemini } = require('./utils/gemini.js');

const app = express();
app.use(cors());
app.use(express.json());

// Proper Express route handler
app.post('/api/gemini', async (req, res) => {
  try {
    const { content, mimeType } = req.body; // frontend sends JSON
    const text = await processContentWithGemini(content, mimeType);
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process content with Gemini' });
  }
});

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});
