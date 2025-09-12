# Pen2PDF - Full-Stack CommonJS Application

A complete full-stack Node.js + React application built with CommonJS modules that converts images with handwriting or text into PDF documents using Google's Gemini AI.

## 🎯 Features

- **Image Upload**: Drag & drop or click to upload images (PNG, JPEG, etc.)
- **AI Text Extraction**: Uses Google Gemini AI to extract text from images
- **PDF Generation**: Converts extracted text into downloadable PDF documents
- **Clean UI**: Simple, gradient-styled interface without external CSS frameworks
- **CommonJS**: Built entirely with CommonJS modules (require/module.exports)
- **Error Handling**: Proper error handling and user feedback
- **Mock Mode**: Works without API key for demonstration purposes

## 🏗️ Architecture

### Backend (Node.js + Express + CommonJS)
- **Port**: 8000
- **Framework**: Express.js
- **Modules**: CommonJS (require/module.exports)
- **Dependencies**: 
  - `express` - Web framework
  - `cors` - Cross-origin resource sharing
  - `dotenv` - Environment variable management
  - `@google/generative-ai` - Google Gemini AI integration
  - `pdfkit` - PDF generation
- **Endpoint**: `POST /api/gemini` - Accepts base64 image, returns PDF

### Frontend (React + CommonJS + Browserify)
- **Port**: 3000
- **Framework**: React (compiled with Browserify + Babel)
- **Modules**: CommonJS (require/module.exports)
- **Build Tool**: Browserify with Babelify transform
- **Styling**: Pure CSS (no external frameworks)
- **Dependencies**:
  - `react` - UI library
  - `react-dom` - DOM rendering
  - `browserify` - Module bundler
  - `babelify` - Babel transform for JSX

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+ recommended)
- npm

### 1. Setup Backend
```bash
cd backend
npm install
```

### 2. Configure Environment (Optional)
```bash
# Create .env file in backend directory
echo "GEMINI_APIKEY=your_actual_api_key_here" > .env
```
*Note: App works without API key using mock responses*

### 3. Setup Frontend
```bash
cd frontend-commonjs
npm install
npm run build
```

### 4. Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
node index.js
```

**Terminal 2 - Frontend:**
```bash
cd frontend-commonjs
npm start
```

### 5. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/gemini
- Health Check: http://localhost:8000/health

## 📝 Usage

1. **Upload Image**: Click "Choose Image" or drag & drop an image file
2. **Process**: Click "Extract Text & Generate PDF" 
3. **Download**: PDF automatically downloads with extracted text
4. **Repeat**: Click "Upload Another Image" for more conversions

## 🔧 API Reference

### POST /api/gemini

**Request:**
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

## 🛠️ Development

### Backend Development
```bash
cd backend
node index.js
```

### Frontend Development
```bash
cd frontend-commonjs
npm run build && npm start
```

### File Structure
```
├── backend/
│   ├── index.js              # Express server
│   ├── utils/gemini.js       # Gemini AI integration
│   ├── package.json          # Backend dependencies
│   └── .env                  # Environment variables
├── frontend-commonjs/
│   ├── src/
│   │   ├── index.js          # React entry point
│   │   └── App.js            # Main React component
│   ├── public/
│   │   ├── index.html        # HTML template
│   │   ├── styles.css        # CSS styles
│   │   └── bundle.js         # Compiled JS (generated)
│   └── package.json          # Frontend dependencies
```

## 🎨 UI Screenshots

1. **Initial Upload Screen**: Clean interface with drag & drop area
2. **File Selected**: Shows file info and process button
3. **Success State**: Confirmation with download option

## 🧪 Testing

The application includes mock responses when no Gemini API key is provided, allowing full functionality testing without external dependencies.

**Test Workflow:**
1. Upload any image file
2. Click "Extract Text & Generate PDF"
3. PDF downloads with demo content
4. Click "Upload Another Image" to reset

## 💡 Production Deployment

1. **Set Gemini API Key**: Replace placeholder in `.env` with actual API key
2. **Build Frontend**: Run `npm run build` in frontend directory
3. **Deploy Backend**: Deploy Node.js app with environment variables
4. **Serve Frontend**: Use production web server (nginx, Apache, etc.)

## 📦 Dependencies Summary

**Backend:**
- express ^5.1.0
- cors ^2.8.5  
- dotenv ^17.2.2
- @google/generative-ai ^1.19.0
- pdfkit ^0.8.0

**Frontend:**
- react ^18.2.0
- react-dom ^18.2.0
- browserify ^17.0.0
- babelify ^10.0.0
- @babel/core ^7.22.0
- @babel/preset-react ^7.22.0

## ⚠️ Important Notes

- **CommonJS Only**: Entire application uses CommonJS modules
- **No ES Modules**: No import/export statements used
- **No Tailwind**: Pure CSS for styling
- **Production Ready**: Includes proper error handling and async/await
- **Mock Fallback**: Works without API key for demonstration