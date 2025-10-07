import React from "react";
import { useNavigate } from "react-router-dom";
import WeekCounter from "../WeekCounter/WeekCounter.jsx";
import "./LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();

  const handleCardClick = (cardType) => {
    if (cardType === "pen2pdf") {
      navigate("/pen2pdf");
    } else if (cardType === "todo") {
      navigate("/todo");
    } else if (cardType === "timetable") {
      navigate("/timetable");
    } else if (cardType === "notes") {
      navigate("/notes");
    } else if (cardType === "whiteboard") {
      navigate("/whiteboard");
    } else if (cardType === "ai-assistant") {
      navigate("/ai-assistant");
    } else {
      console.log("Coming soon");
    }
  };

  return (
    <div className="landing-page">
      <WeekCounter />
      <div className="landing-container">
        <div className="landing-header">
          <h2>Welcome to Pen2PDF Suite</h2>
          <p>Choose from our collection of productivity tools</p>
        </div>
        
        <div className="cards-grid">
          <div 
            className="card" 
            onClick={() => handleCardClick("pen2pdf")}
          >
            <h3>Pen2PDF</h3>
            <p>Convert handwritten notes to PDF documents with AI-powered text extraction</p>
          </div>
          
          <div 
            className="card" 
            onClick={() => handleCardClick("timetable")}
          >
            <h3>Timetable</h3>
            <p>Organize your schedule and manage your time effectively</p>
          </div>
          
          <div 
            className="card" 
            onClick={() => handleCardClick("todo")}
          >
            <h3>To-Do List</h3>
            <p>Keep track of your tasks and boost your productivity</p>
          </div>
          
          <div 
            className="card" 
            onClick={() => handleCardClick("notes")}
          >
            <h3>Notes Generator</h3>
            <p>Create and manage digital notes with smart formatting</p>
          </div>

          <div 
            className="card" 
            onClick={() => handleCardClick("whiteboard")}
          >
            <h3>Whiteboard</h3>
            <p>Collaborate and brainstorm with a full-featured digital whiteboard</p>
          </div>
          
          <div 
            className="card" 
            onClick={() => handleCardClick("ai-assistant")}
          >
            <h3>AI Assistant (Bella)</h3>
            <p>Get intelligent help with your tasks using AI-powered assistance</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;