import React from "react";
import { useNavigate } from "react-router-dom";
import "./AIAssistantToggle.css";

function AIAssistantToggle() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/ai-assistant");
  };

  return (
    <div className="ai-assistant-toggle" onClick={handleClick}>
      <span className="ai-label">AI Assistant </span>
      <span className="ai-icon">🤖</span>
    </div>
  );
}

export default AIAssistantToggle;
  