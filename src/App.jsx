import { useState } from 'react';
import Header from './components/Header';
import UploadComponent from './components/UploadComponent';
import PreviewPanel from './components/PreviewPanel';
import EditPanel from './components/EditPanel';
import ExportButton from './components/ExportButton';
import { processFile } from './utils/fileProcessor';

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [headings, setHeadings] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  const handleFileUpload = async (file) => {
    setUploadedFile(file);
    
    if (!file) {
      setExtractedText('');
      setHeadings({});
      return;
    }

    setIsProcessing(true);
    
    try {
      // Process the file and extract text using Gemini API
      const extractedText = await processFile(file);
      
      setExtractedText(extractedText);
      setIsProcessing(false);
    } catch (error) {
      console.error('Error processing file:', error);
      alert(`Error processing file: ${error.message}`);
      setIsProcessing(false);
    }
  };

  const handleDemo = async () => {
    // Create a mock file object for demo
    const mockFile = {
      name: 'demo-document.txt',
      size: 1024,
      type: 'text/plain'
    };
    
    setUploadedFile(mockFile);
    setIsProcessing(true);
    
    // Simulate processing with sample text
    setTimeout(() => {
      const demoText = `Introduction

This is a demonstration of the Pen2PDF application showing text extraction and editing capabilities.

Key Features
The application supports multiple file formats including PDF, DOCX, and images with OCR processing.

Text Editing
You can click on any word to edit it inline. Select text and mark it as headings using the editing panel.

Export Functionality  
Once you finish editing, export your document as a PDF using the download button.

Conclusion
This demo showcases the clean, dark-themed interface and powerful text processing features of Pen2PDF.`;
      
      setExtractedText(demoText);
      setIsProcessing(false);
    }, 1500);
  };

  const handleTextEdit = (wordIndex, newWord) => {
    const words = extractedText.split(' ');
    words[wordIndex] = newWord;
    setExtractedText(words.join(' '));
  };

  const handleTextUpdate = (newText) => {
    setExtractedText(newText);
  };

  const handleTextSelect = (text) => {
    setSelectedText(text);
  };

  const handleHeadingMark = (selectedText, level) => {
    setHeadings(prev => ({
      ...prev,
      [selectedText]: level
    }));
    setSelectedText(''); // Clear selection after marking
  };

  return (
    <div className="app">
      <Header />
      
      <main className="container main-content">
        {/* Upload Section */}
        <UploadComponent 
          onFileUpload={handleFileUpload}
          uploadedFile={uploadedFile}
          onDemo={handleDemo}
        />

        {/* Processing Status */}
        {isProcessing && (
          <div className="processing-status">
            <svg className="processing-spinner" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="processing-text">Processing file and extracting text...</span>
          </div>
        )}

        {/* Split View: Preview and Editor */}
        {(extractedText || uploadedFile) && !isProcessing && (
          <div className="split-view">
            <PreviewPanel 
              extractedText={extractedText}
              onTextEdit={handleTextEdit}
              onTextSelect={handleTextSelect}
            />
            <EditPanel 
              extractedText={extractedText}
              selectedText={selectedText}
              onTextUpdate={handleTextUpdate}
              onHeadingMark={handleHeadingMark}
            />
          </div>
        )}

        {/* Empty State */}
        {!uploadedFile && !extractedText && (
          <div className="empty-state">
            <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="empty-state-title">Get Started</h3>
            <p className="empty-state-text">Upload a file to begin converting handwriting to editable text</p>
          </div>
        )}
      </main>

      {/* Floating Export Button */}
      <ExportButton 
        extractedText={extractedText}
        headings={headings}
      />
    </div>
  );
}

export default App;
