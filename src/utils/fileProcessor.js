import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

/**
 * Process uploaded file and extract text based on file type
 * @param {File} file - The uploaded file
 * @returns {Promise<string>} - Extracted text content
 */
export async function processFile(file) {
  if (!file) {
    throw new Error('No file provided');
  }

  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  try {
    if (fileType.startsWith('image/')) {
      // Handle image files (JPG, PNG) with OCR
      return await extractTextFromImage(file);
    } else if (fileType === 'application/pdf') {
      // Handle PDF files
      return await extractTextFromPDF(file);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               fileType === 'application/msword') {
      // Handle DOCX files
      return await extractTextFromDOCX(file);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
               fileType === 'application/vnd.ms-powerpoint') {
      // Handle PPTX files - simplified extraction for now
      return await extractTextFromPPTX(file);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error('Error processing file:', error);
    throw new Error(`Failed to process file: ${error.message}`);
  }
}

/**
 * Extract text from image files using Tesseract OCR
 * @param {File} file - Image file
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromImage(file) {
  try {
    const result = await Tesseract.recognize(file, 'eng', {
      logger: m => console.log(m) // Log progress
    });
    
    return result.data.text || 'No text found in image';
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
}

/**
 * Extract text from PDF files
 * @param {File} file - PDF file
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    let extractedText = '';

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      extractedText += pageText + '\n\n';
    }

    return extractedText.trim() || 'No text found in PDF';
  } catch (error) {
    console.error('PDF Processing Error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Extract text from DOCX files
 * @param {File} file - DOCX file
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromDOCX(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    return result.value || 'No text found in document';
  } catch (error) {
    console.error('DOCX Processing Error:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

/**
 * Extract text from PPTX files - simplified implementation
 * @param {File} file - PPTX file
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromPPTX(file) {
  try {
    // For now, return a placeholder message for PPTX files
    // In a full implementation, you would use a library like pptx-parse
    return `PPTX file "${file.name}" uploaded successfully. 
    
Text extraction from PowerPoint files requires specialized processing. 
In a complete implementation, this would extract text from slides, 
including titles, content, and speaker notes.

For demonstration purposes, please try uploading a PDF, DOCX, or image file 
to see the full text extraction capabilities.`;
  } catch (error) {
    console.error('PPTX Processing Error:', error);
    throw new Error('Failed to extract text from PPTX');
  }
}