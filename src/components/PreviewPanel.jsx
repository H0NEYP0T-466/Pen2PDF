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
        <div className="text-center text-gray-500 py-16">
          <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg">Upload a file to see extracted text</p>
        </div>
      );
    }

    const words = extractedText.split(' ');
    
    return (
      <div className="space-y-4">
        {words.map((word, index) => (
          <span key={index} className="inline-block mr-2 mb-2">
            {editingWord === index ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={handleEditSave}
                className="bg-gray-700 text-white px-2 py-1 rounded border border-blue-500 focus:outline-none"
                autoFocus
              />
            ) : (
              <span
                onClick={() => handleWordClick(index, word)}
                className="cursor-pointer hover:bg-gray-700 px-1 py-0.5 rounded transition-colors"
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
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 h-full">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        Text Preview
      </h2>
      
      <div className="bg-gray-900 rounded-lg p-6 min-h-96 max-h-96 overflow-y-auto border border-gray-600">
        <div className="prose prose-invert max-w-none">
          {renderText()}
        </div>
      </div>
      
      {extractedText && (
        <div className="mt-4 text-sm text-gray-400">
          <p>💡 Click on any word to edit it</p>
        </div>
      )}
    </div>
  );
}

export default PreviewPanel;