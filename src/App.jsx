import React, { useCallback, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { marked } from "marked";
import html2pdf from "html2pdf.js";
import "./App.css";

/*
New additions in this version:
- Added "manualMode" state to distinguish between backend extraction vs manual blank document.
- Added a "Start with blank document" button on the upload page.
- Added startBlankDocument() which opens the extracted editor empty (no backend calls).
- Footer now reflects manual mode.
*/

function App() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [extracted, setExtracted] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);

  const [replaceWith, setReplaceWith] = useState("");
  const [manualMode, setManualMode] = useState(false); // NEW: track manual (blank) mode

  const textareaRef = useRef(null);

  // Lock body scroll when extracted screen active
  useEffect(() => {
    if (extracted) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [extracted]);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      files.forEach((f) => {
        if (f._previewUrl) URL.revokeObjectURL(f._previewUrl);
      });
    };
  }, [files]);

  const acceptMime =
    ".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/*";

  const addFiles = useCallback(
    (incoming) => {
      const list = Array.from(incoming || []);
      if (!list.length) return;
      const existingKey = new Set(
        files.map((f) => `${f.name}:${f.size}:${f.lastModified}`)
      );
      const enhanced = list
        .filter(
          (f) => !existingKey.has(`${f.name}:${f.size}:${f.lastModified}`)
        )
        .map((f) => {
          if (f.type.startsWith("image/")) f._previewUrl = URL.createObjectURL(f);
          return f;
        });
      if (!enhanced.length) return;
      setFiles((prev) => [...prev, ...enhanced]);
    },
    [files]
  );

  const handleFileInput = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === e.currentTarget) setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (idx) => {
    setFiles((prev) => {
      const clone = [...prev];
      const f = clone[idx];
      if (f?._previewUrl) URL.revokeObjectURL(f._previewUrl);
      clone.splice(idx, 1);
      return clone;
    });
  };

  const moveFile = (idx, dir) => {
    setFiles((prev) => {
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const clone = [...prev];
      [clone[idx], clone[target]] = [clone[target], clone[idx]];
      return clone;
    });
  };

  const resetToUpload = () => {
    setExtracted(false);
    setExtractedText("");
    setManualMode(false);
  };

  const startBlankDocument = () => {
    // Enter manual mode with an empty document (no backend usage)
    setManualMode(true);
    setExtractedText("");
    setExtracted(true);
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
    const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    let lineEnd = value.indexOf("\n", end);
    if (lineEnd === -1) lineEnd = value.length;
    const selectedBlock = value.slice(lineStart, lineEnd);
    const lines = selectedBlock.split("\n").map((line) => {
      const stripped = line.replace(/^\s{0,3}(#{1,6}\s+)?/, "");
      if (stripped.trim() === "") return "";
      return `${"#".repeat(level)} ${stripped}`;
    });
    const newBlock = lines.join("\n");
    const newText = value.slice(0, lineStart) + newBlock + value.slice(lineEnd);
    setExtractedText(newText);
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

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleExtract = async () => {
    if (!files.length) return;
    setLoading(true);
    setExtracted(false);
    setExtractedText("");
    setManualMode(false); // We are using backend extraction now
    try {
      let combined = "";
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const formData = new FormData();
        formData.append("file", f);
        const response = await axios.post(
          "http://localhost:8000/textExtract",
            formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        const text = (response?.data?.text || "").trimEnd();
        combined += (i === 0 ? "" : "\n\n") + text;
      }
      combined = combined.replace(/^\s*Source\s+WhatsApp.*$/gim, "");
      setExtractedText(combined);
      setExtracted(true);
    } catch (error) {
      console.error("Extraction error:", error);
      alert(
        error?.response?.data?.error ||
          "Extraction failed for one of the files. Check server logs."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const html = marked.parse(extractedText || "");
      const el = document.createElement("div");
      el.className = "printable-light pdf-page";
      el.innerHTML = `
        <style>
          /* Print-safe CSS for PDF generation */
          @page {
            margin: 12mm;
          }
          
          .pdf-page {
            padding: 8mm;
            position: relative;
          }
          
          /* Prevent word breaking and control text flow */
          body, p, li, h1, h2, h3, h4, h5, h6 {
            word-break: normal;
            overflow-wrap: normal;
            word-wrap: normal;
            hyphens: none;
            -webkit-hyphens: none;
            -moz-hyphens: none;
            -ms-hyphens: none;
            text-align: justify;
            text-justify: inter-word;
          }
          
          /* Stronger word protection for all text elements */
          * {
            word-break: normal !important;
            overflow-wrap: normal !important;
            word-wrap: normal !important;
            hyphens: none !important;
            -webkit-hyphens: none !important;
            -moz-hyphens: none !important;
            -ms-hyphens: none !important;
          }
          
          /* Prevent orphaned elements and bad page breaks */
          h1, h2, h3, h4, h5, h6, img, table, pre, blockquote {
            break-inside: avoid;
            page-break-inside: avoid;
            -webkit-column-break-inside: avoid;
          }
          
          /* Keep headings with following content */
          h1, h2, h3, h4, h5, h6 {
            break-after: avoid;
            page-break-after: avoid;
            -webkit-column-break-after: avoid;
          }
          
          /* Orphan and widow control */
          p {
            orphans: 2;
            widows: 2;
          }
          
          .printable-light {
            max-width: none;
            padding: 0;
            color: #111827;
            background: #ffffff;
            font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, 'Noto Sans';
            position: relative;
          }
          .printable-light h1, .printable-light h2, .printable-light h3, .printable-light h4 {
            color: #111827;
            margin: 0 0 12px 0;
            line-height: 1.25;
            font-weight: 700;
          }
          .printable-light h1 { font-size: 26px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
          .printable-light h2 { font-size: 20px; margin-top: 16px; }
          .printable-light h3 { font-size: 17px; margin-top: 12px; }
          .printable-light p, .printable-light li {
            font-size: 12.5pt;
            line-height: 1.6;
            color: #111827;
          }
          .printable-light ul, .printable-light ol { padding-left: 22px; }
          .printable-light strong { font-weight: 700; color: #000; }
          .printable-light hr { border: none; border-top: 1px solid #e5e7eb; margin: 18px 0; }
          .printable-light code { background:#f3f4f6; padding:2px 4px; border-radius:4px; font-size:90%; }
          .printable-light pre code { display:block; padding:14px; }
          
          /* Watermark styles */
          .watermark {
            position: fixed;
            bottom: 16pt;
            right: 16pt;
            opacity: 0.2;
            font-size: 14pt;
            color: #000;
            pointer-events: none;
            z-index: 1000;
            font-family: 'Inter', system-ui, sans-serif;
          }
        </style>
        <div class="watermark">~honeypot</div>
        ${html}
      `;
      document.body.appendChild(el);
      const opt = {
        margin: [34, 34, 34, 34], // 12mm converted to pt (12mm ≈ 34pt)
        filename: "Pen2PDF.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
        pagebreak: { 
          mode: ["css", "legacy"], 
          avoid: ["h1", "h2", "h3", "img", "table", "pre", "blockquote"]
        }
      };
      await html2pdf().set(opt).from(el).save();
      document.body.removeChild(el);
    } catch (e) {
      console.error("PDF download failed:", e);
      alert("Failed to generate PDF. See console for details.");
    }
  };

  const handleDownloadMarkdown = () => {
    try {
      const blob = new Blob([extractedText], {
        type: "text/markdown;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Pen2PDF.md";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Markdown download failed:", e);
      alert("Failed to download markdown.");
    }
  };

  return (
    <div className="app">
      {!extracted ? (
        <div className="upload-container">
          <div className="panel-header">
            <button
              className="back-btn"
              onClick={() => navigate('/')}
              title="Back to main page"
            >
              ←
            </button>
            <h2>Pen2PDF - Document Upload</h2>
          </div>
          
          <input
            type="file"
            id="fileUpload"
            multiple
            onChange={handleFileInput}
            accept={acceptMime}
            className="file-input"
          />

            <label
              htmlFor="fileUpload"
              className={`upload-area ${dragActive ? "drag-active" : ""}`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <strong>Click to browse</strong> or drag & drop files here
              <div className="upload-hint">
                Supported: PDF, PPT, PPTX, Images (PNG/JPG/WebP). Google Slides:
                export as PPTX or PDF first.
              </div>
              <div className="upload-hint">
                Add multiple files; reorder them before extraction.
              </div>
            </label>

          {!!files.length && (
            <>
              <div className="files-list">
                {files.map((f, i) => (
                  <div key={i} className="file-item">
                    {f.type.startsWith("image/") ? (
                      <img
                        src={f._previewUrl}
                        alt={f.name}
                        className="file-thumb"
                      />
                    ) : (
                      <div className="file-thumb">
                        {f.name.split(".").pop().toUpperCase()}
                      </div>
                    )}
                    <div className="file-meta">
                      <div className="file-name">{f.name}</div>
                      <div className="file-size">{formatBytes(f.size)}</div>
                    </div>
                    <div className="file-actions">
                      <div className="reorder-group">
                        <button
                          className="btn outline"
                          disabled={i === 0}
                          onClick={() => moveFile(i, -1)}
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          className="btn outline"
                          disabled={i === files.length - 1}
                          onClick={() => moveFile(i, +1)}
                          title="Move down"
                        >
                          ↓
                        </button>
                      </div>
                      <button
                        className="btn danger"
                        onClick={() => removeFile(i)}
                        title="Remove file"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="actions-row">
                <button
                  className="btn subtle"
                  onClick={() => setFiles([])}
                  disabled={loading}
                >
                  Clear All
                </button>
                <button
                  className="btn primary"
                  onClick={handleExtract}
                  disabled={!files.length || loading}
                >
                  {loading ? "Extracting..." : "Extract All"}
                </button>
                <button
                  className="btn outline"
                  onClick={startBlankDocument}
                  disabled={loading}
                  title="Create a blank editable document (no backend)"
                >
                  Blank Document
                </button>
              </div>
              <div className="helper-text">
                Extraction runs sequentially. Raw text combined exactly—no file
                source headings inserted.
              </div>
            </>
          )}

          {!files.length && (
            <div className="actions-row">
              <button
                className="btn outline"
                onClick={startBlankDocument}
                title="Go directly to an empty editor without uploading files"
              >
                Start with blank document
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="extracted-panel">
          <div className="left-panel">
            <div className="panel-header">
              <button
                className="back-btn"
                onClick={resetToUpload}
                title="Back to upload"
              >
                ←
              </button>
              <button
                className="back-btn"
                onClick={() => navigate('/')}
                title="Back to main page"
                style={{ marginLeft: '8px' }}
              >
                🏠
              </button>
              <h2>
                {manualMode ? "Manual Text Entry (Editable)" : "Extracted Text (Editable)"}
              </h2>
            </div>

            <textarea
              ref={textareaRef}
              className="text-editor"
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              placeholder={
                manualMode
                  ? "Paste or type text here. Use the toolbar on the right to format, then export."
                  : "Extracted text appears here."
              }
            />
          </div>

          <div className="right-panel">
            <h2>Tools</h2>

            <div className="toolbar">
              <button onClick={() => applyHeading(1)} className="btn block">
                H1
              </button>
              <button onClick={() => applyHeading(2)} className="btn block">
                H2
              </button>
              <button onClick={toggleBold} className="btn block">
                Bold
              </button>
            </div>

            <div className="option-group">
              <label htmlFor="replaceInput">Replace selected text</label>
              <input
                id="replaceInput"
                type="text"
                value={replaceWith}
                onChange={(e) => setReplaceWith(e.target.value)}
                placeholder="Replacement text"
                className="input"
              />
              <button className="btn block" onClick={replaceSelection}>
                Apply
              </button>
            </div>

            <hr className="divider" />

            <div className="option-group">
              <button
                className="btn primary block"
                onClick={handleDownloadPDF}
              >
                Download PDF
              </button>
              <button
                className="btn outline block"
                onClick={handleDownloadMarkdown}
              >
                Download Markdown
              </button>
              <button className="btn subtle block" onClick={resetToUpload}>
                Back to Uploads
              </button>
            </div>

            <div className="footer-note">
              Pen2PDF • {manualMode ? "Manual entry mode (no backend)" : "Spacing normal • Markdown export"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;