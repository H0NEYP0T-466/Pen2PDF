import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [extracted, setExtracted] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [heading, setHeading] = useState("h1");
  const [isBold, setIsBold] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setExtracted(false);
    setExtractedText("");
  };

  const handleExtract = async () => {
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "http://localhost:8000/textExtract",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setExtractedText(response.data.text || "");
      setExtracted(true);
    } catch (error) {
      console.error("There was an error!", error);
      alert(
        error?.response?.data?.error ||
          "Extraction failed. Check server logs for details."
      );
    } finally {
      setLoading(false);
    }
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
            accept=".pdf,.ppt,.pptx,image/*"
            className="file-input"
          />
          <label htmlFor="fileUpload" className="upload-area">
            {file ? file.name : "Click or Drag to Upload File"}
          </label>
          {file && (
            <button className="extract-button" onClick={handleExtract} disabled={loading}>
              {loading ? "Extracting..." : "Extract"}
            </button>
          )}
        </div>
      ) : (
        <div className="extracted-panel">
          <div className="left-panel">
            <h2>Extracted Text</h2>
            <div className="text-preview">
              <pre style={{ whiteSpace: "pre-wrap" }}>{extractedText}</pre>
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
                <input type="checkbox" checked={isBold} onChange={handleBoldChange} />
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