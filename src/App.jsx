import React, { useRef, useState } from "react";
import axios from "axios";
import { marked } from "marked";
import html2pdf from "html2pdf.js";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [extracted, setExtracted] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);

  // Toolbar helpers
  const [replaceWith, setReplaceWith] = useState("");
  const textareaRef = useRef(null);

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

  const getSelectionRange = () => {
    const ta = textareaRef.current;
    if (!ta) return { start: 0, end: 0 };
    return { start: ta.selectionStart, end: ta.selectionEnd };
  };

  const applyHeading = (level) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const value = extractedText;
    const { start, end } = getSelectionRange();

    // Find full line boundaries for selection
    const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    let lineEnd = value.indexOf("\n", end);
    if (lineEnd === -1) lineEnd = value.length;

    const selectedBlock = value.slice(lineStart, lineEnd);
    const lines = selectedBlock.split("\n").map((line) => {
      // Remove existing heading markers (up to 3 leading spaces then #... )
      const stripped = line.replace(/^\s{0,3}(#{1,6}\s+)?/, "");
      if (stripped.trim() === "") return ""; // keep empty lines empty
      return `${"#".repeat(level)} ${stripped}`;
    });

    const newBlock = lines.join("\n");
    const newText =
      value.slice(0, lineStart) + newBlock + value.slice(lineEnd);

    setExtractedText(newText);

    // Try to preserve selection roughly
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(lineStart, lineStart + newBlock.length);
    }, 0);
  };

  const toggleBold = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const value = extractedText;
    const { start, end } = getSelectionRange();
    if (start === end) {
      alert("Select some text to bold.");
      return;
    }

    const sel = value.slice(start, end);
    let newSel;

    // If already wrapped in **...**, unwrap; else wrap.
    if (/^\*\*[\s\S]*\*\*$/.test(sel)) {
      newSel = sel.replace(/^\*\*([\s\S]*)\*\*$/, "$1");
    } else {
      newSel = `**${sel}**`;
    }

    const newText = value.slice(0, start) + newSel + value.slice(end);
    setExtractedText(newText);

    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start, start + newSel.length);
    }, 0);
  };

  const replaceSelection = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const value = extractedText;
    const { start, end } = getSelectionRange();

    const newText =
      value.slice(0, start) + (replaceWith ?? "") + value.slice(end);
    setExtractedText(newText);

    setTimeout(() => {
      ta.focus();
      const nextPos = start + (replaceWith?.length || 0);
      ta.setSelectionRange(nextPos, nextPos);
    }, 0);
  };

  const handleDownloadPDF = async () => {
    try {
      // Convert Markdown to HTML
      const html = marked.parse(extractedText || "");

      // Create a detached element for pdf rendering
      const el = document.createElement("div");
      el.className = "printable";
      el.innerHTML = html;

      // Add default print styling for headings/paragraphs
      document.body.appendChild(el);

      const opt = {
        margin: [20, 24, 20, 24], // top, left, bottom, right (pt)
        filename: "Pen2PDF.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      };

      await html2pdf().set(opt).from(el).save();

      document.body.removeChild(el);
    } catch (e) {
      console.error("PDF download failed:", e);
      alert("Failed to generate PDF. See console for details.");
    }
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
            <button
              className="extract-button"
              onClick={handleExtract}
              disabled={loading}
            >
              {loading ? "Extracting..." : "Extract"}
            </button>
          )}
        </div>
      ) : (
        <div className="extracted-panel">
          <div className="left-panel">
            <h2>Extracted Text (Editable)</h2>
            <textarea
              ref={textareaRef}
              className="text-editor"
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              placeholder="Extracted text appears here. You can edit freely."
            />
          </div>

          <div className="right-panel">
            <h2>Text Options</h2>

            <div className="toolbar">
              <button onClick={() => applyHeading(1)} title="Set selected lines as H1">
                Main Heading (H1)
              </button>
              <button onClick={() => applyHeading(2)} title="Set selected lines as H2">
                Sub Heading (H2)
              </button>
              <button onClick={toggleBold} title="Toggle bold on selection">
                Bold
              </button>
            </div>

            <div className="option-group">
              <label htmlFor="replaceInput">Change selected text:</label>
              <input
                id="replaceInput"
                type="text"
                value={replaceWith}
                onChange={(e) => setReplaceWith(e.target.value)}
                placeholder="Replacement text"
                className="replace-input"
              />
              <button onClick={replaceSelection}>Apply</button>
            </div>

            <div className="option-group">
              <button className="download-button" onClick={handleDownloadPDF}>
                Download to PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;