# Pen2PDF - CommonJS Full-Stack Application

A full-stack Node.js + React application that converts images to PDF documents using Google's Gemini AI for text extraction. Built entirely with CommonJS modules.

## Features

- 📷 **Image Upload**: Drag & drop or click to upload images (PNG, JPEG, etc.)
- 🤖 **AI Text Extraction**: Uses Google Gemini AI to extract text from images
- 📄 **PDF Generation**: Converts extracted text to downloadable PDF files
- ⚡ **Real-time Processing**: Shows processing status with loading indicators
- 🎨 **Clean UI**: Simple, responsive design without external CSS frameworks
- 🔧 **CommonJS**: Uses require/module.exports throughout (no ES modules)

## Architecture

### Backend (Node.js + Express)
- **Express server** running on port 8000
- **POST /api/gemini** endpoint for image processing
- **Google Gemini AI** integration for text extraction
- **PDFKit** for PDF generation
- **CORS** enabled for frontend connections
- **dotenv** for environment configuration

### Frontend (React + CommonJS)
- **React** with CommonJS modules (require/module.exports)
- **Browserify + Babel** for bundling
- **Simple CSS** styling (no Tailwind or external frameworks)
- **File upload** with drag & drop support
- **Automatic PDF download** after processing

## Required NPM Packages

### Backend Dependencies
```
express          # Web framework
cors             # Cross-origin resource sharing
dotenv           # Environment variable management
@google/generative-ai  # Google Gemini AI SDK
pdfkit           # PDF generation
body-parser      # Request body parsing
```

### Frontend Dependencies
```
react            # React library
react-dom        # React DOM rendering
browserify       # Module bundling
babelify         # JSX/React transformation
@babel/core      # Babel core
@babel/preset-react  # React preset for Babel
http-server      # Static file serving
```

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Pen2PDF
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure API Key**
   - Get your Gemini API key from: https://aistudio.google.com/app/apikey
   - Edit `backend/.env` and replace `your_gemini_api_key_here` with your actual API key

4. **Start the application**
   
   **Terminal 1 - Backend:**
   ```bash
   npm run start-backend
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   npm run start-frontend
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Health check: http://localhost:8000/health

## Usage

1. **Upload Image**: Click the upload area or drag & drop an image file
2. **Process**: Click "Extract Text & Generate PDF" 
3. **Wait**: The application will show a processing indicator
4. **Download**: PDF will automatically download when ready

## API Endpoints

### POST /api/gemini
Processes an image and returns a PDF with extracted text.

**Request Body:**
```json
{
  "content": "<base64-encoded-image>",
  "mimeType": "image/png"
}
```

**Response:** 
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="extracted-text.pdf"`
- Body: PDF file buffer

**Error Response:**
```json
{
  "error": "Error message"
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "message": "Backend server is running"
}
```

## Project Structure

```
Pen2PDF/
├── backend/                    # Node.js Express backend
│   ├── index.js               # Main server file
│   ├── utils/
│   │   └── gemini.js          # Gemini AI integration
│   ├── package.json           # Backend dependencies
│   └── .env                   # Environment variables
├── frontend-commonjs/          # React frontend
│   ├── src/
│   │   ├── index.js           # React app entry point
│   │   └── App.js             # Main App component
│   ├── public/
│   │   ├── index.html         # HTML template
│   │   ├── styles.css         # Application styles
│   │   └── bundle.js          # Built JavaScript bundle
│   └── package.json           # Frontend dependencies
├── package.json               # Root package scripts
└── README.md                  # This file
```

## CommonJS Implementation

This application uses CommonJS modules throughout:

**Backend Example:**
```javascript
const express = require('express');
const cors = require('cors');
const { processContentWithGemini } = require('./utils/gemini.js');

module.exports = { someFunction };
```

**Frontend Example:**
```javascript
const React = require('react');
const ReactDOM = require('react-dom/client');
const App = require('./App');
```

## Error Handling

- **Missing API Key**: Application provides demo responses when API key is not configured
- **Invalid Files**: Only image files are accepted
- **Network Errors**: Clear error messages displayed to users
- **Processing Failures**: Graceful fallback with informative messages

## Production Deployment

1. **Environment Variables**: Set `GEMINI_APIKEY` in production environment
2. **Build Process**: Run `npm run build` in frontend directory
3. **Static Files**: Serve `frontend-commonjs/public/` with a web server
4. **Backend**: Deploy Node.js backend with process manager (PM2, etc.)
5. **CORS**: Configure CORS settings for production domains

## Development Notes

- Built with **CommonJS** for compatibility with older Node.js environments
- Uses **Browserify** instead of modern bundlers for CommonJS compatibility  
- **No TypeScript** - pure JavaScript implementation
- **Simple CSS** - no external styling frameworks
- **Production-ready** with proper async/await and error handling

## License

ISC License
