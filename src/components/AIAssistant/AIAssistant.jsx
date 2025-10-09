import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { marked } from 'marked';
import markedKatex from "marked-katex-extension";
import 'katex/dist/katex.min.css';
import './AIAssistant.css';

// Configure marked with KaTeX extension for LaTeX rendering
marked.use(markedKatex({
  throwOnError: false,
  nonStandard: true
}));

/*
 * AI Assistant (Bella) Component
 * - CLI-style chat interface
 * - Model selection: LongCat and Gemini models
 * - File upload for Gemini models only
 * - Context panel to select notes as context
 * - Persistent chat history
 * - Markdown and LaTeX rendering support
 */

function AIAssistant() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-pro');
  const [loading, setLoading] = useState(false);
  const [showContextPanel, setShowContextPanel] = useState(false);
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const models = [
    { value: 'longcat-flash-chat', label: 'LongCat-Flash-Chat', supportsFiles: false },
    { value: 'longcat-flash-thinking', label: 'LongCat-Flash-Thinking', supportsFiles: false },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Best Quality)', supportsFiles: true },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Fast)', supportsFiles: true },
    { value: 'gemini-1.5-flash-8b', label: 'Gemini 1.5 Flash-8B (Fastest)', supportsFiles: true },
    { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Experimental)', supportsFiles: true },
  ];

  const currentModel = models.find(m => m.value === selectedModel);

  // Load chat history and notes on mount
  useEffect(() => {
    loadChatHistory();
    loadNotes();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter notes based on search query
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

  // Load chat history from backend
  const loadChatHistory = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/chat');
      if (response.data.success) {
        setMessages(response.data.data.messages || []);
        if (response.data.data.currentModel) {
          setSelectedModel(response.data.data.currentModel);
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  // Load notes from backend
  const loadNotes = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/notes');
      if (response.data.success) {
        setNotes(response.data.data || []);
        setFilteredNotes(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  // Toggle note selection
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

  // Render markdown with LaTeX support
  const renderMarkdown = (content) => {
    const html = marked(content);
    return { __html: html };
  };

  // Handle file upload
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

  // Remove uploaded file
  const removeFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  // Send message
  const sendMessage = async () => {
    if (!inputMessage.trim() && uploadedFiles.length === 0) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      attachments: uploadedFiles,
      contextNotes: selectedNotes
    };

    // Add user message to UI immediately
    setMessages([...messages, userMessage]);
    setInputMessage('');
    setUploadedFiles([]);
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/chat/message', {
        message: inputMessage,
        model: selectedModel,
        attachments: uploadedFiles,
        contextNotes: selectedNotes
      });

      if (response.data.success) {
        // Re-fetch to get the latest messages including the assistant's response
        const chatResponse = await axios.get('http://localhost:8000/api/chat');
        if (chatResponse.data.success) {
          setMessages(chatResponse.data.data.messages || []);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      setMessages([...messages, userMessage, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        model: selectedModel
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key to send message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Clear chat history
  const clearChat = async () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      try {
        await axios.delete('http://localhost:8000/api/chat');
        setMessages([]);
      } catch (error) {
        console.error('Error clearing chat:', error);
      }
    }
  };

  return (
    <div className="ai-assistant-container">
      {/* Header */}
      <div className="ai-header">
        <div className="header-left">
          <button
            className="back-btn"
            onClick={() => navigate('/')}
            title="Back to main page"
          >
            ←
          </button>
          <h1>AI Assistant - Bella</h1>
        </div>
        <div className="header-right">
          <button
            className="context-toggle-btn"
            onClick={() => setShowContextPanel(!showContextPanel)}
          >
            {showContextPanel ? 'Hide' : 'Show'} Context Panel
          </button>
          <button className="clear-btn" onClick={clearChat}>
            Clear Chat
          </button>
        </div>
      </div>

      <div className="ai-content">
        {/* Context Panel */}
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

        {/* Chat Area */}
        <div className="chat-area">
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="welcome-message">
                <h2>👋 Hello! I'm Bella</h2>
                <p>Your AI assistant in the Pen2PDF suite.</p>
                <p>Ask me anything or select notes from the context panel to get insights!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.role}`}>
                  <div className="message-header">
                    <span className="message-role">
                      {msg.role === 'user' ? '> You' : '> Bella'}
                    </span>
                    {msg.model && (
                      <span className="message-model">({msg.model})</span>
                    )}
                  </div>
                  <div className="message-content" dangerouslySetInnerHTML={renderMarkdown(msg.content)} />
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="message-attachments">
                      {msg.attachments.map((att, i) => (
                        <span key={i} className="attachment-tag">
                          📎 {att.fileName}
                        </span>
                      ))}
                    </div>
                  )}
                  {msg.contextNotes && msg.contextNotes.length > 0 && (
                    <div className="message-context">
                      <span>📚 Using {msg.contextNotes.length} note{msg.contextNotes.length > 1 ? 's' : ''} as context</span>
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
            {/* Model Selection and File Upload */}
            <div className="input-controls">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="model-select"
              >
                {models.map(model => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>

              <button
                className="file-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={!currentModel?.supportsFiles}
                title={!currentModel?.supportsFiles ? 'File upload only available for Gemini models' : 'Upload file'}
              >
                📎 {uploadedFiles.length > 0 ? `${uploadedFiles.length} file(s)` : 'Upload'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>

            {/* Uploaded Files */}
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

            {/* Message Input */}
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
                disabled={loading || (!inputMessage.trim() && uploadedFiles.length === 0)}
                className="send-btn"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;
