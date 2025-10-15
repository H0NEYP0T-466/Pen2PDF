import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { marked } from 'marked';
import markedKatex from "marked-katex-extension";
import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import 'katex/dist/katex.min.css';
import ConfirmDialog from '../ui/ConfirmDialog';
import PromptDialog from '../ui/PromptDialog';
import './AIAssistant.css';

/* eslint-disable no-empty */



marked.use(markedKatex({
  throwOnError: false,
  nonStandard: true
}));



function AIAssistant() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-pro');
  const [loading, setLoading] = useState(false);
  const [showContextPanel, setShowContextPanel] = useState(false);
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [clearChatDialogOpen, setClearChatDialogOpen] = useState(false);
  const [saveNoteDialogOpen, setSaveNoteDialogOpen] = useState(false);
  const [noteContentToSave, setNoteContentToSave] = useState('');
  const [saveError, setSaveError] = useState('');
  
  // GitHub Models integration
  const [githubModels, setGithubModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const [rateLimitError, setRateLimitError] = useState(null);

  // Legacy models (kept for backward compatibility)
  const legacyModels = [
    { value: 'longcat-flash-chat', label: 'LongCat-Flash-Chat', supportsFiles: false, available: true, legacy: true },
    { value: 'longcat-flash-thinking', label: 'LongCat-Flash-Thinking', supportsFiles: false, available: true, legacy: true },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', supportsFiles: true, available: true, legacy: true },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', supportsFiles: true, available: true, legacy: true },
  ];

  // Combine legacy and GitHub models
  const allModels = [...legacyModels, ...githubModels];
  const currentModel = allModels.find(m => m.value === selectedModel || m.id === selectedModel);

  
  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);

  
  useEffect(() => {
    loadChatHistory();
    loadNotes();
    loadGithubModels();
  }, []);

  
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages, loading]);

  
  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredNotes(
        notes.filter(note =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.generatedNotes.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredNotes(notes);
    }
  }, [searchQuery, notes]);

  
  const loadChatHistory = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/chat');
      if (response.data.success) {
        setMessages(response.data.data.messages || []);
        if (response.data.data.currentModel) {
          setSelectedModel(response.data.data.currentModel);
        }
      }
    } catch {  }
  };

  const loadNotes = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/notes');
      if (response.data.success) {
        setNotes(response.data.data || []);
        setFilteredNotes(response.data.data || []);
      }
    } catch {  }
  };

  const loadGithubModels = async () => {
    try {
      setLoadingModels(true);
      const response = await axios.get('http://localhost:8000/api/github-models/models');
      if (response.data.success && response.data.models) {
        // Map GitHub models to our format
        const models = response.data.models.map(m => ({
          id: m.id,
          value: m.id,
          label: m.displayName,
          provider: m.provider,
          supportsFiles: m.filePolicy?.allowsFiles || false,
          allowedMimeTypes: m.filePolicy?.allowedMimeTypes || [],
          available: m.available,
          legacy: false
        }));
        setGithubModels(models);
      }
    } catch (error) {
      console.error('Failed to load GitHub models:', error);
    } finally {
      setLoadingModels(false);
    }
  };

  
  const toggleNoteSelection = (note) => {
    const isSelected = selectedNotes.find(n => n.noteId === note._id);
    if (isSelected) {
      setSelectedNotes(selectedNotes.filter(n => n.noteId !== note._id));
    } else {
      setSelectedNotes([...selectedNotes, {
        noteId: note._id,
        title: note.title,
        content: note.generatedNotes
      }]);
    }
  };

  
  const renderMarkdown = (content) => {
    const html = marked(content);
    return { __html: html };
  };

  
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [];

    for (const file of files) {
      const reader = new FileReader();
      const base64 = await new Promise((resolve) => {
        reader.onload = () => {
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        };
        reader.readAsDataURL(file);
      });

      newFiles.push({
        fileName: file.name,
        fileType: file.type,
        fileData: base64
      });
    }

    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  
  const removeFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  
  const sendMessage = async () => {
    if (!inputMessage.trim() && uploadedFiles.length === 0) return;

    // Clear rate limit error when sending new message
    setRateLimitError(null);

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      attachments: uploadedFiles,
      contextNotes: selectedNotes
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');
    const currentFiles = uploadedFiles;
    setUploadedFiles([]);
    setLoading(true);

    try {
      // Check if this is a GitHub model
      const isGithubModel = currentModel && !currentModel.legacy;
      
      if (isGithubModel) {
        // Use GitHub Models API
        const formData = new FormData();
        
        // Build messages array
        const chatMessages = [
          ...messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          })),
          {
            role: 'user',
            content: inputMessage
          }
        ];
        
        formData.append('model', selectedModel);
        formData.append('messages', JSON.stringify(chatMessages));
        
        // Add file if present
        if (currentFiles.length > 0 && currentModel?.supportsFiles) {
          // For GitHub Models, we'll send the first file as a form upload
          const file = currentFiles[0];
          // We need to convert base64 back to file for the API
          const byteString = atob(file.fileData);
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: file.fileType });
          formData.append('file', blob, file.fileName);
        }
        
        const response = await axios.post('http://localhost:8000/api/github-models/chat', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.success) {
          const assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response.data.message,
            timestamp: new Date(),
            model: selectedModel
          };
          setMessages([...messages, userMessage, assistantMessage]);
        }
      } else {
        // Use legacy API
        const response = await axios.post('http://localhost:8000/api/chat/message', {
          message: inputMessage,
          model: selectedModel,
          attachments: currentFiles,
          contextNotes: selectedNotes
        });

        if (response.data.success) {
          const chatResponse = await axios.get('http://localhost:8000/api/chat');
          if (chatResponse.data.success) {
            let updatedMessages = chatResponse.data.data.messages || [];
            if (updatedMessages.length > 50) {
              updatedMessages = updatedMessages.slice(-50);
            }
            setMessages(updatedMessages);
          }
        }
      }
    } catch (error) {
      // Check for rate limit error
      if (error.response?.data?.error?.type === 'rate_limit') {
        setRateLimitError(error.response.data.error.message);
        setMessages([...messages, userMessage, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚠️ ${error.response.data.error.message}`,
          timestamp: new Date(),
          model: selectedModel
        }]);
      } else {
        setMessages([...messages, userMessage, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please try again.',
          timestamp: new Date(),
          model: selectedModel
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = async () => {
    setClearChatDialogOpen(true);
  };

  const handleClearChatConfirm = async () => {
    try {
      await axios.delete('http://localhost:8000/api/chat');
      setMessages([]);
    } catch {
    }

    setClearChatDialogOpen(false);
  };

  const handleClearChatCancel = () => {
    setClearChatDialogOpen(false);
  };

  const copyResponse = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
    }

  };

  const exportToPDF = async (content, messageId) => {
    try {
      const html = marked(content);
      const element = document.createElement('div');
      element.className = 'printable-light pdf-page';

      
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
          ${katexCSS}
          @page { margin: 12mm; }
          .pdf-page { padding: 8mm; position: relative; }
          body, p, li, h1, h2, h3, h4, h5, h6 {
            word-break: normal; overflow-wrap: normal; hyphens: none; text-align: justify; text-justify: inter-word;
          }
          * { word-break: normal !important; overflow-wrap: normal !important; hyphens: none !important; }
          h1, h2, h3, h4, h5, h6, img, table, pre, blockquote { break-inside: avoid; page-break-inside: avoid; }
          h1, h2, h3, h4, h5, h6 { break-after: avoid; page-break-after: avoid; }
          .katex, .katex-display { break-inside: avoid; page-break-inside: avoid; }
          .katex-display { margin: 1em 0; text-align: center; }
          p:has(.katex) { break-inside: avoid; }
          p { orphans: 2; widows: 2; }
          .printable-light { max-width: none; padding: 0; color: #333; background: #fff; font-family: 'Arial', sans-serif; line-height: 1.6; }
          .printable-light h1, .printable-light h2, .printable-light h3 { color: #333; margin: 0 0 12px 0; line-height: 1.25; font-weight: 700; }
          .printable-light p, .printable-light li { font-size: 12.5pt; line-height: 1.6; color: #333; }
          .watermark { position: fixed; bottom: 16pt; right: 16pt; opacity: 0.2; font-size: 14pt; color: #000; pointer-events: none; z-index: 1000; font-family: 'Arial', sans-serif; }
        </style>
        <div class="watermark">~honeypot</div>
        ${html}
      `;

      const opt = {
        margin: [34, 34, 34, 34],
        filename: `ai-response-${messageId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ["css", "legacy"], avoid: ["h1", "h2", "h3", "img", "table", "pre", "blockquote", ".katex", ".katex-display"] }
      };

      await html2pdf().set(opt).from(element).save();
    } catch {  }
  };

  const exportToWord = async (content, messageId) => {
    try {
      const lines = content.split('\n');
      const children = [];
      for (const line of lines) {
        if (line.trim() === '') {
          children.push(new Paragraph({ text: '' }));
          continue;
        }
        if (line.startsWith('# ')) {
          children.push(new Paragraph({ text: line.substring(2), heading: HeadingLevel.HEADING_1, spacing: { before: 240, after: 120 } }));
        } else if (line.startsWith('## ')) {
          children.push(new Paragraph({ text: line.substring(3), heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
        } else if (line.startsWith('### ')) {
          children.push(new Paragraph({ text: line.substring(4), heading: HeadingLevel.HEADING_3, spacing: { before: 160, after: 80 } }));
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          children.push(new Paragraph({ text: line.substring(2), bullet: { level: 0 }, spacing: { before: 60, after: 60 } }));
        } else if (/^\d+\.\s/.test(line)) {
          const text = line.replace(/^\d+\.\s/, '');
          children.push(new Paragraph({ text, numbering: { reference: 'default-numbering', level: 0 }, spacing: { before: 60, after: 60 } }));
        } else {
          const runs = [];
          const parts = line.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
          for (const part of parts) {
            if (part.startsWith('**') && part.endsWith('**')) {
              runs.push(new TextRun({ text: part.slice(2, -2), bold: true }));
            } else if (part.startsWith('*') && part.endsWith('*')) {
              runs.push(new TextRun({ text: part.slice(1, -1), italics: true }));
            } else if (part.startsWith('`') && part.endsWith('`')) {
              runs.push(new TextRun({ text: part.slice(1, -1), font: 'Courier New', shading: { fill: 'E5E7EB' } }));
            } else if (part) {
              runs.push(new TextRun(part));
            }
          }
          children.push(new Paragraph({ children: runs.length > 0 ? runs : [new TextRun(line)], spacing: { before: 100, after: 100 } }));
        }
      }
      const doc = new Document({
        sections: [{ properties: {}, children }],
        numbering: { config: [{ reference: 'default-numbering', levels: [{ level: 0, format: 'decimal', text: '%1.', alignment: AlignmentType.START }] }] }
      });
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-response-${messageId}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {  }
  };

  const saveToNotes = async (content) => {
    setNoteContentToSave(content);
    setSaveNoteDialogOpen(true);
  };

  const handleSaveNoteConfirm = async (title) => {
    if (!title || !title.trim()) {
      setSaveNoteDialogOpen(false);
      return;
    }

    try {
      const noteData = {
        title: title.trim(),
        generatedNotes: noteContentToSave,
        modelUsed: 'AI Assistant',
        originalFiles: []
      };
      const response = await axios.post('http://localhost:8000/api/notes', noteData);
      if (response.data.success) {
        loadNotes();
        setSaveError('');
      } else {
        setSaveError('Failed to save to notes');
      }
    } catch {
      setSaveError('Failed to save to notes');
    }
    setSaveNoteDialogOpen(false);
    setNoteContentToSave('');
  };

  const handleSaveNoteCancel = () => {
    setSaveNoteDialogOpen(false);
    setNoteContentToSave('');
    setSaveError('');
  };

  return (
    <div className="ai-assistant-container">
      <div className="ai-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/')} title="Back to main page">←</button>
          <h1>~Isabella</h1>
        </div>
        <div className="header-right">
          <button className="context-toggle-btn" onClick={() => setShowContextPanel(!showContextPanel)}>
            {showContextPanel ? 'Hide' : 'Show'} Context Panel
          </button>
          <button className="clear-btn" onClick={clearChat}>Clear Chat</button>
        </div>
      </div>

      <div className="ai-content">
        {showContextPanel && (
          <div className="context-panel">
            <h3>Notes Context</h3>
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="notes-search"
            />
            <div className="notes-list">
              {filteredNotes.length === 0 ? (
                <p className="empty-notes">No notes available</p>
              ) : (
                filteredNotes.map(note => (
                  <div key={note._id} className="note-item">
                    <input
                      type="checkbox"
                      checked={selectedNotes.some(n => n.noteId === note._id)}
                      onChange={() => toggleNoteSelection(note)}
                      id={`note-${note._id}`}
                    />
                    <label htmlFor={`note-${note._id}`}>
                      <strong>{note.title}</strong>
                      <span className="note-preview">
                        {note.generatedNotes.substring(0, 100)}...
                      </span>
                    </label>
                  </div>
                ))
              )}
            </div>
            {selectedNotes.length > 0 && (
              <div className="selected-notes-info">
                {selectedNotes.length} note{selectedNotes.length > 1 ? 's' : ''} selected
              </div>
            )}
          </div>
        )}

        <div className="chat-area">
          <div className="messages-container" ref={messagesContainerRef}>
            {messages.length === 0 ? (
              <div className="welcome-message">
                <h2>👋 Hello! I'm Isabella</h2>
                <p>Your AI assistant in the Pen2PDF suite.</p>
                <p>Ask me anything or select notes from the context panel to get insights!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.role}`}>
                  <div className="message-header">
                    <span className="message-role">{msg.role === 'user' ? '> You' : '> Bella'}</span>
                    {msg.model && <span className="message-model">({msg.model})</span>}
                  </div>
                  <div className="message-content" dangerouslySetInnerHTML={renderMarkdown(msg.content)} />
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="message-attachments">
                      {msg.attachments.map((att, i) => (
                        <span key={i} className="attachment-tag">📎 {att.fileName}</span>
                      ))}
                    </div>
                  )}
                  {msg.contextNotes && msg.contextNotes.length > 0 && (
                    <div className="message-context">
                      <span>📚 Using {msg.contextNotes.length} note{msg.contextNotes.length > 1 ? 's' : ''} as context</span>
                    </div>
                  )}
                  {msg.role === 'assistant' && (
                    <div className="message-actions">
                      <button className="action-btn" onClick={() => copyResponse(msg.content)} title="Copy response to clipboard">📋 Copy Response</button>
                      <button className="action-btn" onClick={() => exportToPDF(msg.content, msg.id)} title="Export response to PDF">📄 Export to PDF</button>
                      <button className="action-btn" onClick={() => exportToWord(msg.content, msg.id)} title="Export response to Word">📝 Export to Word</button>
                      <button className="action-btn" onClick={() => saveToNotes(msg.content)} title="Save response to Notes">💾 Save to Notes</button>
                    </div>
                  )}
                </div>
              ))
            )}
            {loading && (
              <div className="message assistant loading">
                <div className="message-header">
                  <span className="message-role">{'> Bella'}</span>
                </div>
                <div className="message-content">
                  <span className="typing-indicator">●●●</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="input-area">
            <div className="input-controls">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="model-select"
                disabled={loadingModels}
              >
                {loadingModels ? (
                  <option>Loading models...</option>
                ) : (
                  <>
                    <optgroup label="Legacy Models">
                      {legacyModels.map(model => (
                        <option key={model.value} value={model.value}>{model.label}</option>
                      ))}
                    </optgroup>
                    {githubModels.length > 0 && (
                      <optgroup label="GitHub Models">
                        {githubModels.map(model => (
                          <option 
                            key={model.id} 
                            value={model.id}
                            disabled={!model.available}
                          >
                            {model.label} {!model.available ? '(unavailable)' : ''}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </>
                )}
              </select>

              <button
                className="file-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={!currentModel?.supportsFiles}
                title={!currentModel?.supportsFiles ? 'This model does not support file uploads' : 'Upload image files (PNG, JPEG, WebP, GIF)'}
              >
                📎 {uploadedFiles.length > 0 ? `${uploadedFiles.length} file(s)` : 'Upload'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                accept={currentModel?.allowedMimeTypes?.join(',') || 'image/*'}
                style={{ display: 'none' }}
              />
            </div>

            {uploadedFiles.length > 0 && (
              <div className="uploaded-files">
                {uploadedFiles.map((file, i) => (
                  <div key={i} className="file-tag">
                    <span>{file.fileName}</span>
                    <button onClick={() => removeFile(i)}>×</button>
                  </div>
                ))}
              </div>
            )}

            <div className="message-input-wrapper">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Shift+Enter for new line)"
                className="message-input"
                rows="3"
              />
              <button
                onClick={sendMessage}
                disabled={loading || (!inputMessage.trim() && uploadedFiles.length === 0) || (currentModel && !currentModel.available)}
                className="send-btn"
                title={currentModel && !currentModel.available ? 'This model is currently unavailable' : ''}
              >
                Send
              </button>
            </div>

            {rateLimitError && (
              <div className="rate-limit-banner" style={{
                padding: '12px',
                background: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '6px',
                marginTop: '8px',
                color: '#92400e',
                fontSize: '14px'
              }}>
                ⚠️ {rateLimitError}
              </div>
            )}

            {currentModel && !currentModel.supportsFiles && (
              <div className="file-restriction-note" style={{
                padding: '8px',
                background: '#e0f2fe',
                border: '1px solid #0284c7',
                borderRadius: '6px',
                marginTop: '8px',
                color: '#075985',
                fontSize: '12px'
              }}>
                ℹ️ Note: .docx, .pdf, and other document types are not supported. Only images (PNG, JPEG, WebP, GIF) can be uploaded to vision-capable models.
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={clearChatDialogOpen}
        title="Clear Chat History"
        message="Are you sure you want to clear the chat history?"
        confirmText="Clear"
        cancelText="Cancel"
        onConfirm={handleClearChatConfirm}
        onCancel={handleClearChatCancel}
      />

      <PromptDialog
        open={saveNoteDialogOpen}
        title="Save to Notes"
        message="Enter a title for this note:"
        placeholder="Note title"
        defaultValue=""
        confirmText="Save"
        cancelText="Cancel"
        onConfirm={handleSaveNoteConfirm}
        onCancel={handleSaveNoteCancel}
      />

      {saveError && (
        <div className="error-toast" style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#ef4444',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '6px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 10001
        }}>
          {saveError}
        </div>
      )}
    </div>
  );
}

export default AIAssistant;