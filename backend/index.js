// index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const PDFDocument = require('pdfkit');
dotenv.config();

const { processContentWithGemini } = require('./utils/gemini.js');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// POST /api/gemini - Extract text from image and return as PDF
app.post('/api/gemini', async (req, res) => {
  try {
    const { content, mimeType } = req.body; // frontend sends JSON with base64 image
    
    if (!content || !mimeType) {
      return res.status(400).json({ error: 'Content and mimeType are required' });
    }

    console.log('Processing content with Gemini...');
    
    // Extract text using Gemini
    const extractedText = await processContentWithGemini(content, mimeType);
    
    if (!extractedText) {
      return res.status(400).json({ error: 'No text could be extracted from the image' });
    }

    console.log('Text extracted, generating PDF...');

    // Create PDF from extracted text
    const doc = new PDFDocument();
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="extracted-text.pdf"');
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Add title
    doc.fontSize(16).text('Extracted Text from Image', { align: 'center' });
    doc.moveDown();
    
    // Add extracted text
    doc.fontSize(12).text(extractedText, {
      align: 'left',
      width: 500
    });
    
    // Finalize PDF
    doc.end();
    
  } catch (err) {
    console.error('Error processing request:', err);
    res.status(500).json({ error: `Failed to process content: ${err.message}` });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' });
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API endpoint: http://localhost:${PORT}/api/gemini`);
});
