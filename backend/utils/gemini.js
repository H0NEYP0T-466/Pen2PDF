// geminiClient.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_APIKEY);

// SYSTEM_PROMPT must be defined here, outside the function
const SYSTEM_PROMPT = `
You are a handwriting-to-digital text converter for an app called Pen2PDF.
Your tasks:
- Extract readable text from the provided input (notes, slides, scanned PDFs, images).
- Ignore spelling mistakes and preserve what was actually written.
- Detect possible headings:
  - H1 = big/main heading
  - H2 = sub-heading
  - H3 = emphasized/bold text
- Return clean, structured text only (no explanations or commentary).
Extract every word; just return the text format.
`;

async function processContentWithGemini(content, mimeType = null) {
  try {
    // Check if we have a valid API key
    if (!process.env.GEMINI_APIKEY || process.env.GEMINI_APIKEY === 'your_gemini_api_key_here') {
      console.log('Using mock response due to missing API key');
      // Return mock extracted text for demo purposes
      return `Extracted Text from Image

This is a demo response from the Pen2PDF application.
In production, this text would be extracted from your uploaded image using Google's Gemini AI.

Key Features:
• Upload images with handwriting or printed text
• AI-powered text extraction using Google Gemini
• Automatic PDF generation
• Clean, user-friendly interface

To use with real images:
1. Set up your Google Gemini API key in the .env file
2. Upload an image with text or handwriting
3. The AI will extract and convert it to a PDF

Thank you for testing Pen2PDF!`;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt;
    if (mimeType && mimeType.startsWith('image/')) {
      prompt = [
        SYSTEM_PROMPT,
        {
          inlineData: {
            data: content,
            mimeType: mimeType
          }
        }
      ];
    } else {
      prompt = `${SYSTEM_PROMPT}\n\nText to process:\n${content}`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text || '';
  } catch (err) {
    console.error('Gemini API error:', err);
    
    // If API fails, provide a helpful mock response
    console.log('Gemini API failed, providing mock response');
    return `Demo Text Extraction

This is a fallback response because the Gemini API is not available.
In a production environment with a valid API key, this would contain 
the actual text extracted from your uploaded image.

Sample extracted content:
• Meeting Notes - January 15, 2024
• Project Requirements
• Action Items:
  - Review specifications
  - Update timeline
  - Schedule follow-up

This demonstrates the PDF generation capability of Pen2PDF.`;
  }
}

module.exports = { processContentWithGemini };
