import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
import html2pdf from 'html2pdf.js';
import 'katex/dist/katex.min.css';
import './Notes.css';

// Configure marked to use KaTeX extension for LaTeX math rendering
marked.use(markedKatex({
  throwOnError: false,
  output: 'html'
}));

function Notes() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [extracted, setExtracted] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [replaceWith, setReplaceWith] = useState('');
  const [fileName, setFileName] = useState('study-notes');
  const [showLibrary, setShowLibrary] = useState(false);
  const [savedNotes, setSavedNotes] = useState([]);
  const [modelUsed, setModelUsed] = useState('');

  const textareaRef = useRef(null);

  const acceptMime = "image/*,.pdf,.ppt,.pptx,.txt,.md,.markdown";

  // Lock body scroll when extracted screen active
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

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      files.forEach((f) => {
        if (f._previewUrl) URL.revokeObjectURL(f._previewUrl);
      });
    };
  }, [files]);

  // Load saved notes on component mount
  useEffect(() => {
    fetchSavedNotes();
  }, []);

  const fetchSavedNotes = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/notes');
      if (response.data.success) {
        setSavedNotes(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching saved notes:', error);
    }
  };

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
    } catch (error) {
      console.error('Notes generation error:', error);
      setError('Failed to generate notes. Please try again.');
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
    
    // Add retry instruction
    formData.append('retryInstruction', 'The user didn\'t like the previous result. Please make this better with more detailed and comprehensive notes.');

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
    } catch (error) {
      console.error('Notes regeneration error:', error);
      setError('Failed to regenerate notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetToUpload = () => {
    setExtracted(false);
    setExtractedText('');
    setError('');
    setModelUsed('');
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
      const html = marked(extractedText);
      const element = document.createElement('div');
      element.className = 'printable-light pdf-page';
      
      // Get KaTeX CSS from the stylesheet
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
      
      element.innerHTML = `
        <style>
          /* KaTeX styles for math rendering */
          ${katexCSS}
          
          /* Print-safe CSS for PDF generation */
          @page {
            margin: 12mm;
          }
          
          .pdf-page {
            padding: 8mm;
            position: relative;
          }
          
          /* Prevent word breaking and control text flow */
          body, p, li, h1, h2, h3, h4, h5, h6 {
            word-break: normal;
            overflow-wrap: normal;
            word-wrap: normal;
            hyphens: none;
            -webkit-hyphens: none;
            -moz-hyphens: none;
            -ms-hyphens: none;
            text-align: justify;
            text-justify: inter-word;
          }
          
          /* Stronger word protection for all text elements */
          * {
            word-break: normal !important;
            overflow-wrap: normal !important;
            word-wrap: normal !important;
            hyphens: none !important;
            -webkit-hyphens: none !important;
            -moz-hyphens: none !important;
            -ms-hyphens: none !important;
          }
          
          /* Prevent orphaned elements and bad page breaks */
          h1, h2, h3, h4, h5, h6, img, table, pre, blockquote {
            break-inside: avoid;
            page-break-inside: avoid;
            -webkit-column-break-inside: avoid;
          }
          
          /* Keep headings with following content */
          h1, h2, h3, h4, h5, h6 {
            break-after: avoid;
            page-break-after: avoid;
            -webkit-column-break-after: avoid;
          }
          
          /* Math equation page break protection */
          .katex, .katex-display {
            break-inside: avoid;
            page-break-inside: avoid;
            -webkit-column-break-inside: avoid;
          }
          
          /* Block math equations get extra spacing and centering */
          .katex-display {
            margin: 1em 0;
            text-align: center;
          }
          
          /* Inline math stays with surrounding text */
          p:has(.katex) {
            break-inside: avoid;
            page-break-inside: avoid;
            -webkit-column-break-inside: avoid;
          }
          
          /* Orphan and widow control */
          p {
            orphans: 2;
            widows: 2;
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
          
          .printable-light h1, .printable-light h2, .printable-light h3 {
            color: #333;
            margin: 0 0 12px 0;
            line-height: 1.25;
            font-weight: 700;
          }
          
          .printable-light p, .printable-light li {
            font-size: 12.5pt;
            line-height: 1.6;
            color: #333;
          }
          
          /* Watermark styles */
          .watermark {
            position: fixed;
            bottom: 16pt;
            right: 16pt;
            opacity: 0.2;
            font-size: 14pt;
            color: #000;
            pointer-events: none;
            z-index: 1000;
            font-family: 'Arial', sans-serif;
          }
        </style>
        <div class="watermark">~honeypot</div>
        ${html}
      `;

      const opt = {
        margin: [34, 34, 34, 34], // 12mm converted to pt (12mm ≈ 34pt)
        filename: `${fileName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
        pagebreak: { 
          mode: ["css", "legacy"], 
          avoid: ["h1", "h2", "h3", "img", "table", "pre", "blockquote", ".katex", ".katex-display"]
        }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (e) {
      console.error('PDF generation failed:', e);
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
    } catch (e) {
      console.error('Markdown download failed:', e);
      setError('Failed to download markdown.');
    }
  };

  const handleDownloadWord = () => {
    try {
      // Convert markdown to HTML first
      const html = marked(extractedText);
      
      // Create a simple Word-compatible HTML document
      const wordContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Study Notes</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 1in; }
        h1, h2, h3 { color: #333; }
        code { background-color: #f4f4f4; padding: 2px 4px; }
        pre { background-color: #f4f4f4; padding: 10px; }
    </style>
</head>
<body>
    ${html}
</body>
</html>`;
      
      const blob = new Blob([wordContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Word download failed:', e);
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
        alert('Notes saved to library successfully!');
        fetchSavedNotes();
      } else {
        setError('Failed to save notes');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      setError('Failed to save notes');
    }
  };

  const deleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:8000/api/notes/${noteId}`);
      
      if (response.data.success) {
        // Remove the deleted note from the local state
        setSavedNotes(prev => prev.filter(note => note._id !== noteId));
        // Optional: Show success message
        // alert('Note deleted successfully!');
      } else {
        setError('Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      setError('Failed to delete note');
    }
  };

  if (showLibrary) {
    return (
      <div className="notes-container">
        <div className="notes-header">
          <div className="header-left">
            <button 
              className="back-btn"
              onClick={() => navigate('/')}
              title="Back to main page"
            >
              ←
            </button>
            <h1>Notes Library</h1>
          </div>
          <button 
            className="btn outline"
            onClick={() => setShowLibrary(false)}
          >
            New Notes
          </button>
        </div>

        <div className="library-grid">
          {savedNotes.length === 0 ? (
            <div className="empty-state">
              <p>No saved notes yet. Create your first study notes!</p>
            </div>
          ) : (
            savedNotes.map(note => (
              <div key={note._id} className="note-card">
                <h3>{note.title}</h3>
                <p className="note-meta">
                  Created: {new Date(note.createdAt).toLocaleDateString()}
                </p>
                <p className="note-meta">
                  Files: {note.originalFiles?.join(', ') || 'N/A'}
                </p>
                <p className="note-meta">
                  Model: {note.modelUsed}
                </p>
                <div className="note-actions">
                  <button 
                    className="btn outline small"
                    onClick={() => {
                      setExtractedText(note.generatedNotes);
                      setFileName(note.title);
                      setModelUsed(note.modelUsed);
                      setExtracted(true);
                      setShowLibrary(false);
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn danger small"
                    onClick={() => deleteNote(note._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

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

            <button
              className="btn subtle block"
              onClick={() => setShowLibrary(true)}
            >
              View Notes Library
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
    </div>
  );
}

export default Notes;