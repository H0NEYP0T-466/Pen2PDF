import React from "react";
import { useNavigate } from "react-router-dom";
import "./NotesLibraryToggle.css";

function NotesLibraryToggle({ setShowLibrary }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/notes");
    setShowLibrary(true);
  };

  return (
    <div className="notes-library-toggle" onClick={handleClick}>
      <span className="notes-label">Notes Library</span>
      <span className="notes-icon">📚</span>
    </div>
  );
}

export default NotesLibraryToggle;
