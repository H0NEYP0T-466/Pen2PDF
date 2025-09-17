import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();

  const handleCardClick = (cardType) => {
    if (cardType === "pen2pdf") {
      navigate("/pen2pdf");
    } else {
      console.log("Coming soon");
    }
  };

  const scrollToCards = () => {
    const cardsSection = document.getElementById("cards-section");
    if (cardsSection) {
      cardsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">WELCOME TO PEN2PDF</h1>
          <p className="hero-subtitle">Convert, organize, and power your productivity with AI.</p>
          <button className="get-started-btn" onClick={scrollToCards}>
            Get Started
          </button>
        </div>
      </div>
      
      {/* Cards Section */}
      <div id="cards-section" className="cards-section">
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
        </div>
      </div>
    </div>
  );
}

export default LandingPage;