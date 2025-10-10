import React, { useState } from "react";
import "./TitleInputModal.css";

function TitleInputModal({ isOpen, onClose, onSubmit, title = "Enter Title" }) {
  const [inputValue, setInputValue] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onSubmit(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      handleClose();
    }
  };

  const handleClose = () => {
    setInputValue("");
    onClose();
  };

  return (
    <div className="title-modal-overlay" onClick={handleClose}>
      <div className="title-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        
        <div className="modal-section">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter a title..."
            autoFocus
          />
        </div>

        <div className="modal-actions">
          <button 
            className="btn primary"
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
          >
            Save
          </button>
          <button 
            className="btn outline"
            onClick={handleClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default TitleInputModal;
