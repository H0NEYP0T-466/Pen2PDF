import React from "react";
import { useNavigate } from "react-router-dom";
import "./NotesLibraryToggle.css";

function NotesLibraryToggle() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/notes");
  };

  return (
    <div className="notes-library-toggle" onClick={handleClick}>
      <span className="notes-label">Notes Library</span>
      <span className="notes-icon">📚</span>
    </div>
  );
}

export default NotesLibraryToggle;
