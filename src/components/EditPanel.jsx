import { useState } from 'react';

function EditPanel({ extractedText, onTextUpdate, onHeadingMark }) {
  const [selectedText, setSelectedText] = useState('');
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
      setSelectedText('');
    }
  };



  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 h-full">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Editing Tools
      </h2>

      <div className="space-y-6">
        {/* Find and Replace */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-md font-medium text-white mb-3">Find & Replace</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Find</label>
              <input
                type="text"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="Enter text to find..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Replace with</label>
              <input
                type="text"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="Enter replacement text..."
              />
            </div>
            <button
              onClick={handleBulkReplace}
              disabled={!findText || !replaceText}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded transition-colors"
            >
              Replace All
            </button>
          </div>
        </div>

        {/* Heading Markers */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-md font-medium text-white mb-3">Mark as Heading</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-300 mb-3">
              {selectedText 
                ? `Selected: "${selectedText.substring(0, 30)}${selectedText.length > 30 ? '...' : ''}"`
                : 'Select text in the preview to mark as heading'
              }
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleHeadingMark('h1')}
                disabled={!selectedText}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-3 rounded text-sm font-bold transition-colors"
              >
                H1
              </button>
              <button
                onClick={() => handleHeadingMark('h2')}
                disabled={!selectedText}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-3 rounded text-sm font-semibold transition-colors"
              >
                H2
              </button>
              <button
                onClick={() => handleHeadingMark('h3')}
                disabled={!selectedText}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-3 rounded text-sm font-medium transition-colors"
              >
                H3
              </button>
            </div>
          </div>
        </div>

        {/* Text Statistics */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-md font-medium text-white mb-3">Text Statistics</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex justify-between">
              <span>Characters:</span>
              <span>{extractedText ? extractedText.length : 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Words:</span>
              <span>{extractedText ? extractedText.split(' ').filter(word => word.trim()).length : 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Lines:</span>
              <span>{extractedText ? extractedText.split('\n').length : 0}</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-md font-medium text-white mb-3">How to Use</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Click words in preview to edit inline</li>
            <li>• Use Find & Replace for bulk corrections</li>
            <li>• Select text and mark as headings</li>
            <li>• Export to PDF when finished</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default EditPanel;