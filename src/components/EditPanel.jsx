import { useState } from 'react';

function EditPanel({ extractedText, selectedText, onTextUpdate, onHeadingMark }) {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  const handleBulkReplace = () => {
    if (findText && replaceText && extractedText) {
      const updatedText = extractedText.replace(new RegExp(findText, 'g'), replaceText);
      onTextUpdate(updatedText);
      setFindText('');
      setReplaceText('');
    }
  };

  const handleHeadingMark = (level) => {
    if (selectedText) {
      onHeadingMark(selectedText, level);
    }
  };



  return (
    <div className="panel">
      <div className="panel-header">
        <svg className="panel-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <h2 className="panel-title">Editing Tools</h2>
      </div>

      <div className="edit-sections">
        {/* Find and Replace */}
        <div className="edit-section">
          <h3 className="edit-section-title">Find & Replace</h3>
          <div className="form-group">
            <label className="form-label">Find</label>
            <input
              type="text"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              className="form-input"
              placeholder="Enter text to find..."
            />
          </div>
          <div className="form-group">
            <label className="form-label">Replace with</label>
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              className="form-input"
              placeholder="Enter replacement text..."
            />
          </div>
          <button
            onClick={handleBulkReplace}
            disabled={!findText || !replaceText}
            className="btn btn-primary btn-full"
          >
            Replace All
          </button>
        </div>

        {/* Heading Markers */}
        <div className="edit-section">
          <h3 className="edit-section-title">Mark as Heading</h3>
          <p className="selected-text">
            {selectedText 
              ? `Selected: "${selectedText.substring(0, 30)}${selectedText.length > 30 ? '...' : ''}"`
              : 'Select text in the preview to mark as heading'
            }
          </p>
          <div className="heading-buttons">
            <button
              onClick={() => handleHeadingMark('h1')}
              disabled={!selectedText}
              className="btn btn-h1"
            >
              H1
            </button>
            <button
              onClick={() => handleHeadingMark('h2')}
              disabled={!selectedText}
              className="btn btn-h2"
            >
              H2
            </button>
            <button
              onClick={() => handleHeadingMark('h3')}
              disabled={!selectedText}
              className="btn btn-h3"
            >
              H3
            </button>
          </div>
        </div>

        {/* Text Statistics */}
        <div className="edit-section">
          <h3 className="edit-section-title">Text Statistics</h3>
          <div className="stats-grid">
            <div className="stat-row">
              <span>Characters:</span>
              <span>{extractedText ? extractedText.length : 0}</span>
            </div>
            <div className="stat-row">
              <span>Words:</span>
              <span>{extractedText ? extractedText.split(' ').filter(word => word.trim()).length : 0}</span>
            </div>
            <div className="stat-row">
              <span>Lines:</span>
              <span>{extractedText ? extractedText.split('\n').length : 0}</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="edit-section">
          <h3 className="edit-section-title">How to Use</h3>
          <div className="instructions">
            <ul>
              <li>• Click words in preview to edit inline</li>
              <li>• Use Find & Replace for bulk corrections</li>
              <li>• Select text and mark as headings</li>
              <li>• Export to PDF when finished</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditPanel;