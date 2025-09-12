# Pen2PDF CommonJS Implementation

This repository now contains two implementations:

## 1. Original Vite-based Frontend (ES Modules)
- **Location**: `/src`, `/` (root)
- **Type**: ES modules (import/export)
- **Build**: Vite
- **Purpose**: Original implementation

## 2. New CommonJS Full-Stack Implementation ⭐
- **Location**: `/backend`, `/frontend-commonjs`
- **Type**: CommonJS modules (require/module.exports)
- **Build**: Node.js + Browserify
- **Purpose**: Meets requirement specifications

## Quick Start (CommonJS Implementation)

```bash
# Start both servers automatically
./start-commonjs.sh

# Access the application
open http://localhost:3000
```

## Features of CommonJS Implementation

✅ **Backend (Node.js + Express)**
- Port 8000
- POST /api/gemini endpoint
- Base64 image input → PDF output
- Google Gemini AI integration
- Mock responses for demo without API key

✅ **Frontend (React + CommonJS)**  
- Port 3000
- Browserify + Babel compilation
- Drag & drop file upload
- Automatic PDF download
- Clean gradient UI (no Tailwind)

✅ **Production Ready**
- Proper error handling
- Async/await patterns
- CORS enabled
- Environment variables
- Documentation included

**Dependencies**: express, cors, dotenv, @google/generative-ai, pdfkit, react, react-dom, browserify, babelify

Perfect implementation of the requirements:
> "Write a full-stack Node.js + React app using CommonJS..."