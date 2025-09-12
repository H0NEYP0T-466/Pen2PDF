import { useState } from 'react';

function PreviewPanel({ extractedText, onTextEdit }) {
  const [editingWord, setEditingWord] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleWordClick = (wordIndex, word) => {
    setEditingWord(wordIndex);
    setEditValue(word);
  };

  const handleEditSave = () => {
    if (editingWord !== null) {
      onTextEdit(editingWord, editValue);
      setEditingWord(null);
      setEditValue('');
    }
  };

  const handleEditCancel = () => {
    setEditingWord(null);
    setEditValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const renderText = () => {
    if (!extractedText) {
      return (
        <div className="empty-preview">
          <svg className="empty-preview-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="empty-preview-title">Upload a file to see extracted text</p>
        </div>
      );
    }

    const words = extractedText.split(' ');
    
    return (
      <div className="preview-text">
        {words.map((word, index) => (
          <span key={index} className="editable-word">
            {editingWord === index ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={handleEditSave}
                className="word-input"
                autoFocus
              />
            ) : (
              <span
                onClick={() => handleWordClick(index, word)}
              >
                {word}
              </span>
            )}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <svg className="panel-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <h2 className="panel-title">Text Preview</h2>
      </div>
      
      <div className="preview-content">
        {renderText()}
      </div>
      
      {extractedText && (
        <div className="preview-tip">
          <p>💡 Click on any word to edit it</p>
        </div>
      )}
    </div>
  );
}

export default PreviewPanel;