import { processContentWithGemini } from './gemini.js';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]; // Remove data:mime;base64, prefix
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Extract text from PDF files
async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// Extract text from DOCX files
async function extractTextFromDOCX(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

// Extract text from PPTX files (basic text extraction)
async function extractTextFromPPTX(file) {
  try {
    // For PPTX, we'll send the file to Gemini to extract text
    // as mammoth doesn't support PPTX well
    const base64 = await fileToBase64(file);
    return await processContentWithGemini(base64, file.type);
  } catch (error) {
    console.error('Error extracting text from PPTX:', error);
    throw new Error('Failed to extract text from PPTX');
  }
}

// Process images with Gemini OCR
async function processImageWithGemini(file) {
  try {
    const base64 = await fileToBase64(file);
    return await processContentWithGemini(base64, file.type);
  } catch (error) {
    console.error('Error processing image with Gemini:', error);
    throw new Error('Failed to process image');
  }
}

// Main file processing function
export async function processFile(file) {
  if (!file) {
    throw new Error('No file provided');
  }

  console.log('Processing file:', file.name, 'Type:', file.type);

  try {
    let extractedText = '';

    // Handle different file types
    if (file.type === 'application/pdf') {
      // For PDFs, first try to extract existing text
      const pdfText = await extractTextFromPDF(file);
      if (pdfText.trim().length > 50) {
        // If we got substantial text, use it
        extractedText = pdfText;
      } else {
        // If PDF has no text or very little text (likely scanned), use Gemini
        const base64 = await fileToBase64(file);
        extractedText = await processContentWithGemini(base64, file.type);
      }
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               file.type === 'application/msword') {
      // DOCX/DOC files
      extractedText = await extractTextFromDOCX(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || 
               file.type === 'application/vnd.ms-powerpoint') {
      // PPTX/PPT files
      extractedText = await extractTextFromPPTX(file);
    } else if (file.type.startsWith('image/')) {
      // Image files (JPEG, PNG, etc.)
      extractedText = await processImageWithGemini(file);
    } else {
      throw new Error(`Unsupported file type: ${file.type}`);
    }

    // If we have text from document extraction, enhance it with Gemini
    if (extractedText && !file.type.startsWith('image/') && 
        file.type !== 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      try {
        // Send the extracted text to Gemini for cleaning and formatting
        const enhancedText = await processContentWithGemini(extractedText);
        return enhancedText || extractedText; // Fallback to original if enhancement fails
      } catch (error) {
        console.warn('Failed to enhance text with Gemini, using original:', error);
        return extractedText;
      }
    }

    return extractedText;

  } catch (error) {
    console.error('Error processing file:', error);
    throw error;
  }
}

export default { processFile };