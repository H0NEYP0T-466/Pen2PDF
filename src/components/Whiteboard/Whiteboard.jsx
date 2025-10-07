import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fabric } from 'fabric';
import { jsPDF } from 'jspdf';
import axios from 'axios';
import './Whiteboard.css';

/*
 * Whiteboard Component
 * - Full-screen canvas for drawing, text, and images
 * - Supports freehand drawing, text placement, image paste/drag-drop
 * - Move, resize, and delete elements
 * - Undo/redo functionality
 * - Save/export to image and PDF
 * - Auto-save and load last saved state
 */

function Whiteboard() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [tool, setTool] = useState('pen'); // pen, text, select, eraser
  const [color, setColor] = useState('#FFFFFF');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Initialize canvas
  useEffect(() => {
    const fabricCanvas = new fabric.Canvas('whiteboard-canvas', {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#0A0A0A',
      isDrawingMode: tool === 'pen',
    });

    // Configure drawing brush
    fabricCanvas.freeDrawingBrush.color = color;
    fabricCanvas.freeDrawingBrush.width = strokeWidth;

    setCanvas(fabricCanvas);

    // Load saved whiteboard state
    loadWhiteboard(fabricCanvas);

    // Handle window resize
    const handleResize = () => {
      fabricCanvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      fabricCanvas.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update canvas when tool changes
  useEffect(() => {
    if (!canvas) return;
    canvas.isDrawingMode = tool === 'pen';
    
    if (tool === 'select') {
      canvas.selection = true;
    } else {
      canvas.selection = false;
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  }, [tool, canvas]);

  // Update brush properties
  useEffect(() => {
    if (!canvas) return;
    canvas.freeDrawingBrush.color = color;
    canvas.freeDrawingBrush.width = strokeWidth;
  }, [color, strokeWidth, canvas]);

  // Save to history after drawing
  useEffect(() => {
    if (!canvas) return;

    const handleObjectAdded = () => {
      saveToHistory();
      autoSave();
    };

    const handleObjectModified = () => {
      saveToHistory();
      autoSave();
    };

    canvas.on('object:added', handleObjectAdded);
    canvas.on('object:modified', handleObjectModified);

    return () => {
      canvas.off('object:added', handleObjectAdded);
      canvas.off('object:modified', handleObjectModified);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas]);

  // Load whiteboard state from backend
  const loadWhiteboard = async (fabricCanvas) => {
    try {
      const response = await axios.get('http://localhost:8000/api/whiteboard');
      if (response.data.success && response.data.data.elements) {
        const jsonData = JSON.stringify(response.data.data.elements);
        if (jsonData && jsonData !== '[]') {
          fabricCanvas.loadFromJSON({ objects: response.data.data.elements }, () => {
            fabricCanvas.renderAll();
          });
        }
      }
    } catch (error) {
      console.error('Error loading whiteboard:', error);
    }
  };

  // Auto-save whiteboard state
  const autoSave = async () => {
    if (!canvas) return;
    
    try {
      const elements = canvas.toJSON().objects;
      await axios.post('http://localhost:8000/api/whiteboard', { elements });
    } catch (error) {
      console.error('Error saving whiteboard:', error);
    }
  };

  // Save current state to history for undo/redo
  const saveToHistory = () => {
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON());
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(json);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  // Undo
  const undo = () => {
    if (historyStep > 0) {
      const prevStep = historyStep - 1;
      setHistoryStep(prevStep);
      canvas.loadFromJSON(history[prevStep], () => {
        canvas.renderAll();
      });
    }
  };

  // Redo
  const redo = () => {
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1;
      setHistoryStep(nextStep);
      canvas.loadFromJSON(history[nextStep], () => {
        canvas.renderAll();
      });
    }
  };

  // Add text to canvas
  const addText = () => {
    if (!canvas) return;
    const text = new fabric.IText('Double click to edit', {
      left: canvas.width / 2,
      top: canvas.height / 2,
      fill: color,
      fontSize: 24,
      fontFamily: 'Arial',
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  // Handle image paste/upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      fabric.Image.fromURL(event.target.result, (img) => {
        img.scaleToWidth(300);
        img.set({
          left: canvas.width / 2 - 150,
          top: canvas.height / 2,
        });
        canvas.add(img);
        canvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle image paste from clipboard
  useEffect(() => {
    const handlePaste = (e) => {
      if (!canvas) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          const reader = new FileReader();
          reader.onload = (event) => {
            fabric.Image.fromURL(event.target.result, (img) => {
              img.scaleToWidth(300);
              img.set({
                left: canvas.width / 2 - 150,
                top: canvas.height / 2,
              });
              canvas.add(img);
              canvas.renderAll();
            });
          };
          reader.readAsDataURL(blob);
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [canvas]);

  // Delete selected object
  const deleteSelected = () => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
      activeObjects.forEach((obj) => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.renderAll();
      autoSave();
    }
  };

  // Clear entire board
  const clearBoard = async () => {
    if (!canvas) return;
    if (window.confirm('Are you sure you want to clear the entire whiteboard?')) {
      canvas.clear();
      canvas.backgroundColor = '#0A0A0A';
      canvas.renderAll();
      try {
        await axios.delete('http://localhost:8000/api/whiteboard');
      } catch (error) {
        console.error('Error clearing whiteboard:', error);
      }
    }
  };

  // Export as image
  const exportAsImage = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
    });
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = dataURL;
    link.click();
  };

  // Export as PDF
  const exportAsPDF = () => {
    if (!canvas) return;
    const imgData = canvas.toDataURL({
      format: 'png',
      quality: 1,
    });
    
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('whiteboard.pdf');
  };

  return (
    <div className="whiteboard-container">
      {/* Toolbar */}
      <div className="whiteboard-toolbar">
        <button
          className="back-btn"
          onClick={() => navigate('/')}
          title="Back to main page"
        >
          ←
        </button>

        <div className="toolbar-section">
          <button
            className={`toolbar-btn ${tool === 'pen' ? 'active' : ''}`}
            onClick={() => setTool('pen')}
            title="Draw"
          >
            ✏️
          </button>
          <button
            className={`toolbar-btn ${tool === 'text' ? 'active' : ''}`}
            onClick={() => {
              setTool('select');
              addText();
            }}
            title="Add Text"
          >
            T
          </button>
          <button
            className={`toolbar-btn ${tool === 'select' ? 'active' : ''}`}
            onClick={() => setTool('select')}
            title="Select"
          >
            ⬚
          </button>
        </div>

        <div className="toolbar-section">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="color-picker"
            title="Color"
          />
          <input
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="stroke-slider"
            title="Stroke Width"
          />
        </div>

        <div className="toolbar-section">
          <label className="toolbar-btn" title="Upload Image">
            📷
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </label>
          <button
            className="toolbar-btn"
            onClick={deleteSelected}
            title="Delete Selected"
          >
            🗑️
          </button>
        </div>

        <div className="toolbar-section">
          <button
            className="toolbar-btn"
            onClick={undo}
            disabled={historyStep <= 0}
            title="Undo"
          >
            ↶
          </button>
          <button
            className="toolbar-btn"
            onClick={redo}
            disabled={historyStep >= history.length - 1}
            title="Redo"
          >
            ↷
          </button>
        </div>

        <div className="toolbar-section">
          <button
            className="toolbar-btn"
            onClick={clearBoard}
            title="Clear Board"
          >
            Clear
          </button>
          <button
            className="toolbar-btn"
            onClick={exportAsImage}
            title="Export as Image"
          >
            PNG
          </button>
          <button
            className="toolbar-btn"
            onClick={exportAsPDF}
            title="Export as PDF"
          >
            PDF
          </button>
        </div>
      </div>

      {/* Canvas */}
      <canvas id="whiteboard-canvas" ref={canvasRef} />
    </div>
  );
}

export default Whiteboard;
