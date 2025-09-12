import React, { useState , useEffect } from "react";
import axios from 'axios'
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [extracted, setExtracted] = useState(false);
  const [heading, setHeading] = useState("h1");
  const [isBold, setIsBold] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:8000/').then(response => {
      console.log(response.data);
    }).catch(error => {
      console.error('There was an error!', error);
    });

    console.log("Frontend is Successfully connected to Backend");
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setExtracted(false);
  };

  const handleExtract = () => {
    setExtracted(true);
  };

  const handleHeadingChange = (e) => {
    setHeading(e.target.value);
  };

  const handleBoldChange = () => {
    setIsBold(!isBold);
  };

  return (
    <div className="app">
      <nav className="navbar">
        <h1>Pen2PDF</h1>
      </nav>

      {!extracted ? (
        <div className="upload-container">
          <input
            type="file"
            id="fileUpload"
            onChange={handleFileChange}
            accept=".pdf,.pptx,image/*"
            className="file-input"
          />
          <label htmlFor="fileUpload" className="upload-area">
            {file ? file.name : "Click or Drag to Upload File"}
          </label>
          {file && (
            <button className="extract-button" onClick={handleExtract}>
              Extract
            </button>
          )}
        </div>
      ) : (
        <div className="extracted-panel">
          <div className="left-panel">
            <h2>Extracted Text</h2>
            <div className="text-preview">
              {/* Extracted text will appear here later */}
            </div>
          </div>
          <div className="right-panel">
            <h2>Text Options</h2>
            <div className="option-group">
              <label>
                Heading:
                <select value={heading} onChange={handleHeadingChange}>
                  <option value="h1">H1</option>
                  <option value="h2">H2</option>
                  <option value="h3">H3</option>
                </select>
              </label>
            </div>
            <div className="option-group">
              <label>
                <input
                  type="checkbox"
                  checked={isBold}
                  onChange={handleBoldChange}
                />
                Bold
              </label>
            </div>
            <div className="option-group">
              <button className="download-button">Download to PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
