import { useState } from 'react';
import Header from './components/Header';
import UploadComponent from './components/UploadComponent';
import PreviewPanel from './components/PreviewPanel';
import EditPanel from './components/EditPanel';
import ExportButton from './components/ExportButton';

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [headings, setHeadings] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (file) => {
    setUploadedFile(file);
    
    if (!file) {
      setExtractedText('');
      setHeadings({});
      return;
    }

    setIsProcessing(true);
    
    try {
      // TODO: Replace with actual API call to Gemini
      // For now, simulate API call with placeholder text
      setTimeout(() => {
        const mockText = `Sample Extracted Text

This is a demonstration of the Pen2PDF application. In a real implementation, this text would be extracted from your uploaded file using the Gemini API.

Key Features:
- File upload for PDF, JPG, PNG, PPTX
- Text extraction using AI
- Inline word editing
- Heading markup (H1, H2, H3)
- PDF export functionality

You can click on any word in this preview to edit it inline. You can also select text and mark it as different heading levels using the editing tools on the right.

The final edited text can be exported as a PDF document for download.`;
        
        setExtractedText(mockText);
        setIsProcessing(false);
      }, 2000);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleTextEdit = (wordIndex, newWord) => {
    const words = extractedText.split(' ');
    words[wordIndex] = newWord;
    setExtractedText(words.join(' '));
  };

  const handleTextUpdate = (newText) => {
    setExtractedText(newText);
  };

  const handleHeadingMark = (selectedText, level) => {
    setHeadings(prev => ({
      ...prev,
      [selectedText]: level
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Upload Section */}
        <div className="mb-8">
          <UploadComponent 
            onFileUpload={handleFileUpload}
            uploadedFile={uploadedFile}
          />
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <div className="mb-8 bg-blue-600 rounded-lg p-4 flex items-center">
            <svg className="animate-spin h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-white">Processing file and extracting text...</span>
          </div>
        )}

        {/* Split View: Preview and Editor */}
        {(extractedText || uploadedFile) && !isProcessing && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PreviewPanel 
              extractedText={extractedText}
              onTextEdit={handleTextEdit}
            />
            <EditPanel 
              extractedText={extractedText}
              onTextUpdate={handleTextUpdate}
              onHeadingMark={handleHeadingMark}
            />
          </div>
        )}

        {/* Empty State */}
        {!uploadedFile && !extractedText && (
          <div className="text-center py-16">
            <svg className="mx-auto h-24 w-24 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-400 mb-2">Get Started</h3>
            <p className="text-gray-500">Upload a file to begin converting handwriting to editable text</p>
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
