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
      // Process the file to extract text
      const extractedText = await processFile(file);
      
      // Simulate AI processing for text cleaning and spell correction
      // In a real implementation, this would call Gemini/GPT/Claude API
      const cleanedText = await simulateAIProcessing(extractedText);
      
      setExtractedText(cleanedText);
      setIsProcessing(false);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
      setIsProcessing(false);
    }
  };

  const simulateAIProcessing = async (text) => {
    // Simulate AI API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, this would send text to AI API for:
    // - Spell correction
    // - Grammar improvement
    // - Suggest headings/subheadings
    // - Preserve handwriting content even if sloppy
    
    // For demo purposes, add some cleaned text with suggested headings
    return `Introduction
    
${text}

Key Features
- File upload support for multiple formats
- Text extraction from images and documents
- Inline text editing capabilities
- Heading markup functionality
- PDF export with proper formatting

Conclusion
The extracted text has been processed and cleaned for better readability.`;
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
