import React, { useState, useEffect } from "react";
import "./WeekCounter.css";

function WeekCounter() {
  const [currentWeek, setCurrentWeek] = useState(3);
  const [showModal, setShowModal] = useState(false);
  const [manualWeek, setManualWeek] = useState("");

  // Initialize week counter from localStorage or set defaults
  useEffect(() => {
    const initializeWeekCounter = () => {
      const storedWeek = localStorage.getItem("universityWeek");
      const storedStartDate = localStorage.getItem("universityWeekStartDate");

      if (storedWeek && storedStartDate) {
        const startDate = new Date(storedStartDate);
        const now = new Date();
        
        // Calculate the number of weeks that have passed since start date
        const weeksPassed = Math.floor((now - startDate) / (7 * 24 * 60 * 60 * 1000));
        const calculatedWeek = parseInt(storedWeek) + weeksPassed;
        
        setCurrentWeek(calculatedWeek);
      } else {
        // First time initialization - set to Week 3 and record the start date
        const now = new Date();
        // Set to the most recent Monday at 12:00 AM
        const lastMonday = new Date(now);
        lastMonday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
        lastMonday.setHours(0, 0, 0, 0);
        
        localStorage.setItem("universityWeek", "3");
        localStorage.setItem("universityWeekStartDate", lastMonday.toISOString());
        setCurrentWeek(3);
      }
    };

    initializeWeekCounter();
  }, []);

  // Check for week increment every minute
  useEffect(() => {
    const checkWeekIncrement = () => {
      const storedStartDate = localStorage.getItem("universityWeekStartDate");
      const storedWeek = localStorage.getItem("universityWeek");
      
      if (storedStartDate && storedWeek) {
        const startDate = new Date(storedStartDate);
        const now = new Date();
        
        // Calculate weeks passed
        const weeksPassed = Math.floor((now - startDate) / (7 * 24 * 60 * 60 * 1000));
        const calculatedWeek = parseInt(storedWeek) + weeksPassed;
        
        if (calculatedWeek !== currentWeek) {
          setCurrentWeek(calculatedWeek);
        }
      }
    };

    // Check every minute for week changes
    const interval = setInterval(checkWeekIncrement, 60000);
    return () => clearInterval(interval);
  }, [currentWeek]);

  const handleResetWeek = () => {
    const now = new Date();
    // Set to the most recent Monday at 12:00 AM
    const lastMonday = new Date(now);
    lastMonday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    lastMonday.setHours(0, 0, 0, 0);
    
    localStorage.setItem("universityWeek", "1");
    localStorage.setItem("universityWeekStartDate", lastMonday.toISOString());
    setCurrentWeek(1);
    setShowModal(false);
  };

  const handleManualUpdate = () => {
    const weekNum = parseInt(manualWeek);
    if (!isNaN(weekNum) && weekNum > 0) {
      const now = new Date();
      // Set to the most recent Monday at 12:00 AM
      const lastMonday = new Date(now);
      lastMonday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      lastMonday.setHours(0, 0, 0, 0);
      
      localStorage.setItem("universityWeek", weekNum.toString());
      localStorage.setItem("universityWeekStartDate", lastMonday.toISOString());
      setCurrentWeek(weekNum);
      setManualWeek("");
      setShowModal(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleManualUpdate();
    }
  };

  return (
    <>
      <div className="week-counter" onClick={() => setShowModal(true)}>
        <span className="week-label">Week</span>
        <span className="week-number">#{currentWeek}</span>
      </div>

      {showModal && (
        <div className="week-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="week-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Week Counter Settings</h3>
            
            <div className="modal-section">
              <label>Current Week</label>
              <div className="current-week-display">Week #{currentWeek}</div>
            </div>

            <div className="modal-section">
              <label htmlFor="manual-week">Update to Week Number</label>
              <input
                id="manual-week"
                type="number"
                min="1"
                value={manualWeek}
                onChange={(e) => setManualWeek(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter week number"
              />
              <button 
                className="btn primary"
                onClick={handleManualUpdate}
                disabled={!manualWeek}
              >
                Update Week
              </button>
            </div>

            <div className="modal-section">
              <button 
                className="btn danger"
                onClick={handleResetWeek}
              >
                Reset to Week 1
              </button>
            </div>

            <button 
              className="btn outline"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default WeekCounter;
