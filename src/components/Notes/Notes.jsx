import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import 'katex/dist/katex.min.css';
import SuccessNotification from '../ui/SuccessNotification';
import './Notes.css';

marked.use(markedKatex({
  throwOnError: false,
  output: 'html',
  nonStandard: true
}));

/**
 * Sanitizes text for PDF generation by removing mojibake and control characters
 * while preserving emojis, watermark, and legitimate content.
 * @param {string} text - The text to sanitize
 * @returns {string} - The sanitized text
 */
function sanitizeForPdf(text) {
  if (!text) return '';
  
  // Normalize using NFKC to handle Unicode inconsistencies
  let sanitized = text.normalize('NFKC');
  
  // Remove known mojibake sequences
  const mojibakePatterns = [
    /Ø=ÜÑ/g,
    /Ø<ß/g,
    /%æ/g,
    /Ã¢â‚¬â„¢/g,  // common UTF-8 mojibake
    /â€™/g,        // another common pattern
    /Â§/g,         // section sign mojibake
    /Â /g,         // non-breaking space mojibake
  ];
  
  mojibakePatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  // Remove ASCII control characters (0x00-0x1F) except newline (0x0A) and tab (0x09)
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  // Collapse duplicated heading markers (e.g., "### ### Title" -> "### Title")
  sanitized = sanitized.replace(/^(#{1,6})\s+\1+\s+/gm, '$1 ');
  
  return sanitized;
}

function Notes() {
  const navigate = useNavigate();
  const location = useLocation();
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [extracted, setExtracted] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [replaceWith, setReplaceWith] = useState('');
  const [fileName, setFileName] = useState('study-notes');
  const [modelUsed, setModelUsed] = useState('');
  const [selectedModelForGeneration, setSelectedModelForGeneration] = useState('gemini-2.5-pro');
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  const textareaRef = useRef(null);

  // Available models for notes generation
  const availableModels = [
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  ];

  const acceptMime = "image/*,.pdf,.ppt,.pptx,.txt,.md,.markdown";

  useEffect(() => {
    if (location.state?.extracted) {
      setExtracted(true);
      setExtractedText(location.state.extractedText || '');
      setFileName(location.state.fileName || 'study-notes');
      setModelUsed(location.state.modelUsed || '');
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    if (extracted) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [extracted]);

  useEffect(() => {
    return () => {
      files.forEach((f) => {
        if (f._previewUrl) URL.revokeObjectURL(f._previewUrl);
      });
    };
  }, [files]);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    const processedFiles = newFiles.map((file, index) => ({
      file,
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      type: file.type,
      _previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    setFiles(prev => [...prev, ...processedFiles]);
  };

  const removeFile = (fileId) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?._previewUrl) {
        URL.revokeObjectURL(fileToRemove._previewUrl);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const clearAllFiles = () => {
    files.forEach(f => {
      if (f._previewUrl) URL.revokeObjectURL(f._previewUrl);
    });
    setFiles([]);
  };

  const startBlankDocument = () => {
    setExtracted(true);
    setExtractedText('');
    setModelUsed('Manual Entry');
  };

  const generateNotes = async () => {
    if (files.length === 0) {
      setError('Please select at least one file to generate notes from.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    files.forEach(({ file }) => {
      formData.append(`files`, file);
    });
    
    // Add selected model to the request
    formData.append('preferredModel', selectedModelForGeneration);

    try {
      const response = await axios.post('http://localhost:8000/notesGenerate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });

      if (response.data.success) {
        setExtractedText(response.data.text);
        setModelUsed(response.data.modelUsed || 'Gemini');
        setExtracted(true);
      } else {
        setError(response.data.error || 'Failed to generate notes');
      }
    } catch (err) {
      // Check if error suggests trying a different model
      const errorMessage = err.response?.data?.error || err.message || 'Failed to generate notes. Please try again.';
      if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('unavailable')) {
        setError(errorMessage + ' Please select a different model and try again.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const retryGeneration = async () => {
    setLoading(true);
    setError('');

    const formData = new FormData();
    files.forEach(({ file }) => {
      formData.append(`files`, file);
    });
    
    // Add retry instruction and preferred model
    formData.append('retryInstruction', 'The user didn\'t like the previous result. Please make this better with more detailed and comprehensive notes.');
    formData.append('preferredModel', selectedModelForGeneration);

    try {
      const response = await axios.post('http://localhost:8000/notesGenerate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });

      if (response.data.success) {
        setExtractedText(response.data.text);
        setModelUsed(response.data.modelUsed || 'Gemini');
      } else {
        setError(response.data.error || 'Failed to regenerate notes');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to regenerate notes. Please try again.';
      if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('unavailable')) {
        setError(errorMessage + ' Please select a different model and try again.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetToUpload = () => {
    setExtracted(false);
    setExtractedText('');
    setError('');
    setModelUsed('');
    setFiles([]);
  };

  const replaceSelection = () => {
    if (!replaceWith.trim()) return;
    
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start === end) {
      setError('Please select text to replace');
      return;
    }

    const newText = extractedText.substring(0, start) + replaceWith + extractedText.substring(end);
    setExtractedText(newText);
    setReplaceWith('');
    setError('');
  };

  const handleDownloadPDF = async () => {
    try {
      // Sanitize text for PDF (only in this pipeline, not mutating state)
      const sanitizedText = sanitizeForPdf(extractedText);
      const html = marked(sanitizedText);
      
      // Extract KaTeX CSS from stylesheets
      const katexCSS = Array.from(document.styleSheets)
        .filter(sheet => {
          try {
            return sheet.href && sheet.href.includes('katex');
          } catch {
            return false;
          }
        })
        .map(sheet => {
          try {
            return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
          } catch {
            return '';
          }
        })
        .join('\n');
      
      // Helper function to render PDF with specific font size
      const renderPdfWithFontSize = async (baseFontSize) => {
        const element = document.createElement('div');
        element.className = 'printable-light pdf-page';
        
        element.innerHTML = `
          <style>
            ${katexCSS}
            @page { 
              margin: 12mm; 
              size: A4;
            }
            .pdf-page { 
              padding: 8mm; 
              position: relative; 
              padding-bottom: 20mm;
            }
            body, p, li, h1, h2, h3, h4, h5, h6 {
              word-break: normal;
              overflow-wrap: break-word;
              word-wrap: break-word;
              hyphens: none;
              -webkit-hyphens: none;
              -moz-hyphens: none;
              -ms-hyphens: none;
            }
            p, li {
              page-break-inside: avoid;
              break-inside: avoid;
              orphans: 2;
              widows: 2;
            }
            h1, h2, h3, h4, h5, h6 {
              page-break-inside: avoid;
              break-inside: avoid;
              page-break-after: avoid;
              break-after: avoid;
            }
            img, table, pre, blockquote, code {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .katex, .katex-display {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .katex-display { 
              margin: 1em 0; 
              text-align: center; 
            }
            p:has(.katex) {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .printable-light {
              max-width: none;
              padding: 0;
              color: #333;
              background: #ffffff;
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              position: relative;
            }
            .printable-light::after {
              content: "";
              display: block;
              height: 15mm;
            }
            .printable-light h1 {
              color: #333;
              margin: 0 0 12px 0;
              line-height: 1.25;
              font-weight: 700;
              font-size: ${baseFontSize * 1.8}pt;
            }
            .printable-light h2 {
              color: #333;
              margin: 0 0 10px 0;
              line-height: 1.25;
              font-weight: 700;
              font-size: ${baseFontSize * 1.5}pt;
            }
            .printable-light h3 {
              color: #333;
              margin: 0 0 8px 0;
              line-height: 1.25;
              font-weight: 700;
              font-size: ${baseFontSize * 1.3}pt;
            }
            .printable-light h4, .printable-light h5, .printable-light h6 {
              color: #333;
              margin: 0 0 6px 0;
              line-height: 1.25;
              font-weight: 700;
              font-size: ${baseFontSize * 1.1}pt;
            }
            .printable-light p, .printable-light li {
              font-size: ${baseFontSize}pt;
              line-height: 1.6;
              color: #333;
              margin-bottom: 0.5em;
            }
            .printable-light pre, .printable-light code {
              font-size: ${baseFontSize * 0.9}pt;
            }
          </style>
          ${html}
        `;
        
        // Create PDF instance
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'pt',
          format: 'a4'
        });
        
        // Render HTML to PDF
        await pdf.html(element, {
          callback: function() {
            // Callback will be handled after
          },
          x: 34,
          y: 34,
          width: 527, // A4 width (595pt) - margins (34pt * 2)
          windowWidth: 794, // A4 width in pixels at 96 DPI
          margin: [34, 34, 34, 34]
        });
        
        // Clean up
        element.remove();
        
        return pdf;
      };
      
      // Initial render with base font size
      let baseFontSize = 12.5;
      const minFontSize = 10;
      const maxPages = 25;
      const maxIterations = 5;
      let iteration = 0;
      let pdf = await renderPdfWithFontSize(baseFontSize);
      let pageCount = pdf.internal.getNumberOfPages();
      
      // Adaptive pagination: reduce font size if too many pages
      while (pageCount > maxPages && baseFontSize > minFontSize && iteration < maxIterations) {
        iteration++;
        baseFontSize = Math.max(minFontSize, baseFontSize - 0.5);
        pdf = await renderPdfWithFontSize(baseFontSize);
        pageCount = pdf.internal.getNumberOfPages();
      }
      
      // Add watermark to all pages
      const watermarkText = "~honeypot";
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(120, 120, 120);
      
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const textWidth = pdf.getTextWidth(watermarkText);
        const x = pageWidth - textWidth - 40; // Right margin
        const y = pageHeight - 20; // Bottom margin
        pdf.text(watermarkText, x, y);
      }
      
      // Save the PDF
      pdf.save(`${fileName}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      setError('Failed to generate PDF.');
    }
  };

  const handleDownloadMarkdown = () => {
    try {
      const blob = new Blob([extractedText], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError('Failed to download markdown.');
    }
  };

  
  const handleDownloadWord = async () => {
    try {
      const lines = extractedText.split('\n');
      const children = [];

      for (const line of lines) {
        if (line.trim() === '') {
          children.push(new Paragraph({ text: '' }));
          continue;
        }

        if (line.startsWith('# ')) {
          children.push(new Paragraph({
            text: line.substring(2),
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 }
          }));
        } else if (line.startsWith('## ')) {
          children.push(new Paragraph({
            text: line.substring(3),
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }));
        } else if (line.startsWith('### ')) {
          children.push(new Paragraph({
            text: line.substring(4),
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 160, after: 80 }
          }));
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          children.push(new Paragraph({
            text: line.substring(2),
            bullet: { level: 0 },
            spacing: { before: 60, after: 60 }
          }));
        } else if (/^\d+\.\s/.test(line)) {
          const text = line.replace(/^\d+\.\s/, '');
          children.push(new Paragraph({
            text: text,
            numbering: { reference: 'default-numbering', level: 0 },
            spacing: { before: 60, after: 60 }
          }));
        } else {
          const runs = [];
          const parts = line.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

          for (const part of parts) {
            if (part.startsWith('**') && part.endsWith('**')) {
              runs.push(new TextRun({ text: part.slice(2, -2), bold: true }));
            } else if (part.startsWith('*') && part.endsWith('*')) {
              runs.push(new TextRun({ text: part.slice(1, -1), italics: true }));
            } else if (part.startsWith('`') && part.endsWith('`')) {
              runs.push(new TextRun({
                text: part.slice(1, -1),
                font: 'Courier New',
                shading: { fill: 'E5E7EB' }
              }));
            } else if (part) {
              runs.push(new TextRun(part));
            }
          }

          children.push(new Paragraph({
            children: runs.length > 0 ? runs : [new TextRun(line)],
            spacing: { before: 100, after: 100 }
          }));
        }
      }

      const doc = new Document({
        sections: [{
          properties: {},
          children: children
        }],
        numbering: {
          config: [{
            reference: 'default-numbering',
            levels: [{
              level: 0,
              format: 'decimal',
              text: '%1.',
              alignment: AlignmentType.START
            }]
          }]
        }
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError('Failed to download Word document.');
    }
  };

  const saveToLibrary = async () => {
    if (!extractedText.trim()) {
      setError('No notes to save');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/notes', {
        title: fileName,
        originalFiles: files.map(f => f.name),
        generatedNotes: extractedText,
        modelUsed: modelUsed
      });

      if (response.data.success) {
        setError('');
        setShowSuccessNotification(true);
      } else {
        setError('Failed to save notes');
      }
    } catch {
      setError('Failed to save notes');
    }
  };

  return (
    <div className="notes-container">
      {!extracted ? (
        <div className="upload-container">
          <div className="panel-header">
            <button
              className="back-btn"
              onClick={() => navigate('/')}
              title="Back to main page"
            >
              ←
            </button>
            <h2>Notes Generator - Upload Documents</h2>
          </div>
          
          <input
            type="file"
            id="fileUpload"
            multiple
            onChange={handleFileInput}
            accept={acceptMime}
            className="file-input"
          />

          <label
            htmlFor="fileUpload"
            className={`upload-area ${dragActive ? "drag-active" : ""}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <strong>Click to browse</strong> or drag & drop files here
            <div className="upload-hint">
              Supported: PDF, PPT, PPTX, Images, TXT, Markdown. Multiple files will be processed together.
            </div>
            <div className="upload-hint">
              Upload your study materials and get AI-generated comprehensive notes.
            </div>
          </label>

          {!!files.length && (
            <div className="files-section">
              <div className="files-header">
                <h3>Uploaded Files ({files.length})</h3>
                <button className="btn danger small" onClick={clearAllFiles}>
                  Clear All
                </button>
              </div>
              
              <div className="files-list">
                {files.map((fileItem) => (
                  <div key={fileItem.id} className="file-item">
                    <div className="file-info">
                      <span className="file-name">{fileItem.name}</span>
                      <span className="file-size">
                        {(fileItem.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <button
                      className="btn danger small"
                      onClick={() => removeFile(fileItem.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Model Selector */}
          <div className="model-selector-section">
            <label htmlFor="model-select" className="model-selector-label">
              Select AI Model for Notes Generation:
            </label>
            <select
              id="model-select"
              value={selectedModelForGeneration}
              onChange={(e) => setSelectedModelForGeneration(e.target.value)}
              className="model-selector"
              disabled={loading}
            >
              {availableModels.map(model => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
            <p className="model-selector-hint">
              If the selected model encounters an error, please try a different model.
            </p>
          </div>

          <div className="action-buttons">
            <button
              className="btn primary block"
              onClick={generateNotes}
              disabled={loading || files.length === 0}
            >
              {loading ? 'Generating Notes...' : 'Generate Study Notes'}
            </button>
            
            <button
              className="btn outline block"
              onClick={startBlankDocument}
            >
              Start with Empty Document
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
          {loading && (
            <div className="loading-message">
              <p>Generating comprehensive study notes using AI...</p>
              <p>This may take a few moments for large files.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="extracted-panel">
          <div className="left-panel">
            <div className="panel-header">
              <button
                className="back-btn"
                onClick={resetToUpload}
                title="Back to upload"
              >
                ←
              </button>
              <button
                className="back-btn"
                onClick={() => navigate('/')}
                title="Back to main page"
                style={{ marginLeft: '8px' }}
              >
                🏠
              </button>
              <h2>Generated Study Notes (Editable)</h2>
            </div>

            <textarea
              ref={textareaRef}
              className="text-editor"
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              placeholder="Your AI-generated study notes will appear here. You can edit them as needed."
            />
          </div>

          <div className="right-panel">
            <div className="panel-header">
              <h2>Download Options</h2>
            </div>

            <div className="option-group">
              <label htmlFor="fileName">File Name:</label>
              <input
                id="fileName"
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter filename"
                className="input"
              />
            </div>

            <hr className="divider" />

            <div className="option-group">
              <label htmlFor="replaceText">Replace Selected Text:</label>
              <input
                id="replaceInput"
                type="text"
                value={replaceWith}
                onChange={(e) => setReplaceWith(e.target.value)}
                placeholder="Replacement text"
                className="input"
              />
              <button className="btn block" onClick={replaceSelection}>
                Apply
              </button>
            </div>

            <hr className="divider" />

            <div className="option-group">
              <button
                className="btn primary block"
                onClick={handleDownloadPDF}
              >
                Download PDF
              </button>
              <button
                className="btn outline block"
                onClick={handleDownloadMarkdown}
              >
                Download Markdown
              </button>
              <button
                className="btn outline block"
                onClick={handleDownloadWord}
              >
                Download Word
              </button>
              <button className="btn subtle block" onClick={saveToLibrary}>
                Save to Library
              </button>
              <button className="btn block" onClick={retryGeneration}>
                Retry Generation
              </button>
              <button className="btn subtle block" onClick={resetToUpload}>
                Back to Uploads
              </button>
            </div>

            <div className="footer-note">
              Notes Generator • Model used: {modelUsed} • AI-powered study notes
            </div>
          </div>
        </div>
      )}
      
      <SuccessNotification
        open={showSuccessNotification}
        message="Notes saved to library successfully."
        onClose={() => setShowSuccessNotification(false)}
      />
    </div>
  );
}

export default Notes;