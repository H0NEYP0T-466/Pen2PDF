# 📝 Pen2PDF

<p align="center">

  <!-- Core -->
  ![GitHub License](https://img.shields.io/github/license/H0NEYP0T-466/Pen2PDF?style=for-the-badge&color=brightgreen)  
  ![GitHub Stars](https://img.shields.io/github/stars/H0NEYP0T-466/Pen2PDF?style=for-the-badge&color=yellow)  
  ![GitHub Forks](https://img.shields.io/github/forks/H0NEYP0T-466/Pen2PDF?style=for-the-badge&color=blue)  
  ![GitHub Issues](https://img.shields.io/github/issues/H0NEYP0T-466/Pen2PDF?style=for-the-badge&color=red)  
  ![GitHub Pull Requests](https://img.shields.io/github/issues-pr/H0NEYP0T-466/Pen2PDF?style=for-the-badge&color=orange)  
  ![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen?style=for-the-badge)  

  <!-- Activity -->
  ![Last Commit](https://img.shields.io/github/last-commit/H0NEYP0T-466/Pen2PDF?style=for-the-badge&color=purple)  
  ![Commit Activity](https://img.shields.io/github/commit-activity/m/H0NEYP0T-466/Pen2PDF?style=for-the-badge&color=teal)  
  ![Repo Size](https://img.shields.io/github/repo-size/H0NEYP0T-466/Pen2PDF?style=for-the-badge&color=blueviolet)  
  ![Code Size](https://img.shields.io/github/languages/code-size/H0NEYP0T-466/Pen2PDF?style=for-the-badge&color=indigo)  

![Alt](https://repobeats.axiom.co/api/embed/8fe1986afa1884c7762d23efbe8593e501c7f292.svg "Repobeats analytics image")

  <!-- Languages -->
  ![Top Language](https://img.shields.io/github/languages/top/H0NEYP0T-466/Pen2PDF?style=for-the-badge&color=critical)  
  ![Languages Count](https://img.shields.io/github/languages/count/H0NEYP0T-466/Pen2PDF?style=for-the-badge&color=success)  

  <!-- Community -->
  ![Documentation](https://img.shields.io/badge/Docs-Available-green?style=for-the-badge&logo=readthedocs&logoColor=white)  
  ![Open Source Love](https://img.shields.io/badge/Open%20Source-%E2%9D%A4-red?style=for-the-badge)  

</p>

**A comprehensive productivity suite that combines AI-powered document processing, schedule management, task organization, and intelligent note-taking in one unified platform.**

Pen2PDF Suite is a modern web application that offers six powerful productivity tools: AI-powered text extraction and PDF conversion, intelligent timetable management with Excel/CSV import, comprehensive todo list management with subtasks, smart notes generation with a searchable library, a full-featured digital whiteboard, and an AI assistant (Bella) for intelligent help - all designed to streamline your academic and professional workflow.

## 🔗 Links

- [Demo](#-usage) - See the application in action
- [Documentation](#-table-of-contents) - Complete setup and usage guide
- [Issues](https://github.com/H0NEYP0T-466/Pen2PDF/issues) - Report bugs or request features
- [Contributing](CONTRIBUTING.md) - Help improve the project

## 📚 Table of Contents

- [🚀 Features](#-features)
- [⚡ Tech Stack](#-tech-stack)
- [📦 Dependencies & Packages](#-dependencies--packages)
- [📋 Prerequisites](#-prerequisites)
- [🛠️ Installation](#-installation)
- [💻 Usage](#-usage)
- [📁 Project Structure](#-project-structure)
- [📦 Submodules](#-submodules)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🛡️ Security](#-security)
- [📏 Code of Conduct](#-code-of-conduct)
- [🗺️ Roadmap](#-roadmap)
- [🙏 Acknowledgements](#-acknowledgements)

## 🚀 Features

### 📝 Pen2PDF - AI-Powered Document Conversion
- **🤖 AI-Powered Text Extraction**: Uses Google Gemini AI to extract text from various file formats
- **📝 Multiple File Format Support**: PDF, PPT, PPTX, PNG, JPG, WebP
- **✏️ Real-time Markdown Editor**: Edit extracted text with live markdown formatting
- **📄 Professional PDF Export**: Generate high-quality PDFs with custom styling
- **📤 Markdown Export**: Download content as markdown files
- **🎯 Drag & Drop Interface**: Intuitive file upload with drag-and-drop support
- **📋 Blank Document Mode**: Start with a blank document without file upload

### 📅 Timetable Management
- **📊 Schedule Organization**: Create and manage your daily, weekly schedules
- **📁 Excel/CSV Import**: Import timetable data from CSV, XLSX, and XLS files
- **🏫 Class Management**: Organize subjects, teachers, rooms, and class types (Theory/Lab)
- **⏰ Time Slot Management**: Manage class timings and daily schedules
- **🔄 Bulk Operations**: Import multiple entries at once with validation
- **🗓️ Weekly View**: Visualize your entire week's schedule in an organized format

### ✅ TodoList - Task Management
- **📋 Task Organization**: Create todo cards with organized task lists
- **🔗 Subtask Support**: Break down complex tasks into manageable subtasks
- **📌 Priority Pinning**: Pin important subtasks for quick access
- **✓ Progress Tracking**: Mark tasks and subtasks as completed
- **📊 Task Statistics**: View completion progress and task analytics
- **🎯 Focus Mode**: Expandable cards to focus on specific task groups

### 📚 Notes Generation & Library
- **🤖 Smart Notes Creation**: AI-powered generation of study notes from uploaded files
- **📖 Notes Library**: Searchable collection of all your generated notes
- **📝 Rich Text Support**: Create and edit notes with markdown formatting
- **🔄 Note Regeneration**: Retry note generation with improved prompts
- **💾 Persistent Storage**: Save and organize notes in a dedicated library
- **🎯 Blank Note Creation**: Start with empty documents for manual note-taking

### 🤖 AI Assistant (Bella) - Intelligent Help
- **💬 Multi-Model Support**: Switch between LongCat, Gemini, and GitHub Models
  - LongCat-Flash-Chat
  - LongCat-Flash-Thinking
  - Gemini 2.5 Pro
  - Gemini 2.5 Flash
  - **GitHub Models (new)**: Access GPT-4o, GPT-4, Claude, and more via GitHub Models API
    - Runtime model discovery with your GitHub PAT
    - Fallback to catalog when discovery unavailable
    - Supports gpt-4o, gpt-4o-mini, claude-3-5-sonnet, claude-4, and more
- **🧠 Smart Context Window**: AI remembers last 20 messages for coherent conversations
- **📝 Markdown & LaTeX Rendering**: Beautiful formatting for code, math equations, and text
- **📎 File Upload**: Upload files for context (vision-capable models only)
  - Supports images: PNG, JPEG, WebP, GIF
  - Blocked types: .docx, .pdf, .ppt, .pptx, .rtf (no server-side conversion yet)
  - Client-side and server-side validation
- **📚 Notes Context**: Load and select notes from your library as context
- **🔍 Smart Search**: Search through notes to find relevant context
- **💾 Chat Persistence**: Conversation history is saved and loaded automatically
- **🎯 CLI-Style Interface**: Clean, terminal-inspired chat interface with syntax highlighting
- **🔄 Dynamic Model Switching**: Seamlessly switch between AI models mid-conversation
- **⚠️ Rate Limit Handling**: Graceful error handling with model switch suggestions

### 🌐 Universal Features
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **⚡ Fast Processing**: Efficient processing and data management
- **🎨 Modern UI**: Clean, intuitive interface with consistent design
- **🔐 Local Storage**: Secure data management with MongoDB integration

## ⚡ Tech Stack

### Languages
![JavaScript](https://img.shields.io/badge/JavaScript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![HTML5](https://img.shields.io/badge/HTML5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)

### Frontend Frameworks & Libraries
![React](https://img.shields.io/badge/React-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/Vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)

### Backend Frameworks
![Express.js](https://img.shields.io/badge/Express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Node.js](https://img.shields.io/badge/Node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

### Databases
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000.svg?style=for-the-badge&logo=mongoose&logoColor=white)

### AI
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)
![LongCat](https://img.shields.io/badge/LongCat-FF6B6B?style=for-the-badge&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMCAxOGMtNC40MSAwLTgtMy41OS04LThzMy41OS0)

### Tools & Libraries
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Marked](https://img.shields.io/badge/Marked-000000?style=for-the-badge&logo=markdown&logoColor=white)
![html2pdf.js](https://img.shields.io/badge/html2pdf.js-FF6B6B?style=for-the-badge&logo=javascript&logoColor=white)
![Papa Parse](https://img.shields.io/badge/Papa_Parse-FF9900?style=for-the-badge&logo=javascript&logoColor=white)
![XLSX](https://img.shields.io/badge/XLSX-217346?style=for-the-badge&logo=microsoft-excel&logoColor=white)
![KaTeX](https://img.shields.io/badge/KaTeX-008080?style=for-the-badge&logo=latex&logoColor=white)
![Fabric.js](https://img.shields.io/badge/Fabric.js-FF6B6B?style=for-the-badge&logo=javascript&logoColor=white)
![docx](https://img.shields.io/badge/docx-2B579A?style=for-the-badge&logo=microsoft-word&logoColor=white)
![CORS](https://img.shields.io/badge/CORS-000000?style=for-the-badge&logo=javascript&logoColor=white)

### DevOps & Development Tools
![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)
![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![Dotenv](https://img.shields.io/badge/Dotenv-ECD53F?style=for-the-badge&logo=dotenv&logoColor=black)

## 📦 Dependencies & Packages

This project uses carefully selected packages across frontend and backend to deliver powerful features. Below is the complete list of dependencies organized by category.

<details open>
<summary><h3>🎨 Frontend Runtime Dependencies</h3></summary>

#### Core Libraries
[![axios](https://img.shields.io/npm/v/axios?style=for-the-badge&label=axios&color=5A29E4)](https://www.npmjs.com/package/axios)
[![react](https://img.shields.io/npm/v/react?style=for-the-badge&label=react&color=61DAFB)](https://www.npmjs.com/package/react)
[![react-dom](https://img.shields.io/npm/v/react-dom?style=for-the-badge&label=react-dom&color=61DAFB)](https://www.npmjs.com/package/react-dom)
[![react-router-dom](https://img.shields.io/npm/v/react-router-dom?style=for-the-badge&label=react-router-dom&color=CA4245)](https://www.npmjs.com/package/react-router-dom)

#### Document Processing & Export
[![docx](https://img.shields.io/npm/v/docx?style=for-the-badge&label=docx&color=2B579A)](https://www.npmjs.com/package/docx)
[![html2pdf.js](https://img.shields.io/npm/v/html2pdf.js?style=for-the-badge&label=html2pdf.js&color=FF6B6B)](https://www.npmjs.com/package/html2pdf.js)
[![jspdf](https://img.shields.io/npm/v/jspdf?style=for-the-badge&label=jspdf&color=F16529)](https://www.npmjs.com/package/jspdf)
[![xlsx](https://img.shields.io/npm/v/xlsx?style=for-the-badge&label=xlsx&color=217346)](https://www.npmjs.com/package/xlsx)
[![papaparse](https://img.shields.io/npm/v/papaparse?style=for-the-badge&label=papaparse&color=FF9900)](https://www.npmjs.com/package/papaparse)

#### Markdown & Math Rendering
[![marked](https://img.shields.io/npm/v/marked?style=for-the-badge&label=marked&color=000000)](https://www.npmjs.com/package/marked)
[![markdown-it](https://img.shields.io/npm/v/markdown-it?style=for-the-badge&label=markdown-it&color=000000)](https://www.npmjs.com/package/markdown-it)
[![katex](https://img.shields.io/npm/v/katex?style=for-the-badge&label=katex&color=008080)](https://www.npmjs.com/package/katex)
[![marked-katex-extension](https://img.shields.io/npm/v/marked-katex-extension?style=for-the-badge&label=marked-katex-extension&color=008080)](https://www.npmjs.com/package/marked-katex-extension)

#### Canvas & Graphics
[![fabric](https://img.shields.io/npm/v/fabric?style=for-the-badge&label=fabric&color=FF6B6B)](https://www.npmjs.com/package/fabric)

#### Configuration & Environment
[![dotenv](https://img.shields.io/npm/v/dotenv?style=for-the-badge&label=dotenv&color=ECD53F)](https://www.npmjs.com/package/dotenv)

</details>

<details>
<summary><h3>🛠️ Frontend Dev/Build Dependencies</h3></summary>

#### Build Tools
[![vite](https://img.shields.io/npm/v/vite?style=for-the-badge&label=vite&color=646CFF)](https://www.npmjs.com/package/vite)
[![@vitejs/plugin-react](https://img.shields.io/npm/v/@vitejs/plugin-react?style=for-the-badge&label=@vitejs/plugin-react&color=646CFF)](https://www.npmjs.com/package/@vitejs/plugin-react)

#### Code Quality & Linting
[![eslint](https://img.shields.io/npm/v/eslint?style=for-the-badge&label=eslint&color=4B3263)](https://www.npmjs.com/package/eslint)
[![@eslint/js](https://img.shields.io/npm/v/@eslint/js?style=for-the-badge&label=@eslint/js&color=4B3263)](https://www.npmjs.com/package/@eslint/js)
[![eslint-plugin-react-hooks](https://img.shields.io/npm/v/eslint-plugin-react-hooks?style=for-the-badge&label=eslint-plugin-react-hooks&color=4B3263)](https://www.npmjs.com/package/eslint-plugin-react-hooks)
[![eslint-plugin-react-refresh](https://img.shields.io/npm/v/eslint-plugin-react-refresh?style=for-the-badge&label=eslint-plugin-react-refresh&color=4B3263)](https://www.npmjs.com/package/eslint-plugin-react-refresh)

#### Type Definitions
[![@types/react](https://img.shields.io/npm/v/@types/react?style=for-the-badge&label=@types/react&color=3178C6)](https://www.npmjs.com/package/@types/react)
[![@types/react-dom](https://img.shields.io/npm/v/@types/react-dom?style=for-the-badge&label=@types/react-dom&color=3178C6)](https://www.npmjs.com/package/@types/react-dom)

#### Utilities
[![globals](https://img.shields.io/npm/v/globals?style=for-the-badge&label=globals&color=777777)](https://www.npmjs.com/package/globals)

</details>

<details open>
<summary><h3>⚙️ Backend Runtime Dependencies</h3></summary>

#### Server Framework
[![express](https://img.shields.io/npm/v/express?style=for-the-badge&label=express&color=000000)](https://www.npmjs.com/package/express)
[![cors](https://img.shields.io/npm/v/cors?style=for-the-badge&label=cors&color=000000)](https://www.npmjs.com/package/cors)
[![express-fileupload](https://img.shields.io/npm/v/express-fileupload?style=for-the-badge&label=express-fileupload&color=000000)](https://www.npmjs.com/package/express-fileupload)

#### Database
[![mongoose](https://img.shields.io/npm/v/mongoose?style=for-the-badge&label=mongoose&color=880000)](https://www.npmjs.com/package/mongoose)

#### AI Integration
[![@google/genai](https://img.shields.io/npm/v/@google/genai?style=for-the-badge&label=@google/genai&color=4285F4)](https://www.npmjs.com/package/@google/genai)

#### Configuration
[![dotenv](https://img.shields.io/npm/v/dotenv?style=for-the-badge&label=dotenv&color=ECD53F)](https://www.npmjs.com/package/dotenv)

</details>

<details>
<summary><h3>🧪 Backend Dev/Test Dependencies</h3></summary>

#### Testing Tools
[![mongodb-memory-server](https://img.shields.io/npm/v/mongodb-memory-server?style=for-the-badge&label=mongodb-memory-server&color=4ea94b)](https://www.npmjs.com/package/mongodb-memory-server)

</details>

### 📌 Key Dependencies Overview

| Package | Purpose | Category |
|---------|---------|----------|
| **axios** | HTTP client for API requests | Frontend - Network |
| **react** | UI framework for building interactive interfaces | Frontend - Core |
| **docx** | Create and export .docx documents | Frontend - Document Processing |
| **html2pdf.js** | Generate PDFs from HTML content | Frontend - PDF Generation |
| **marked** | Markdown parsing and rendering | Frontend - Markdown |
| **katex** | LaTeX math equation rendering | Frontend - Math Rendering |
| **fabric** | Canvas manipulation for whiteboard | Frontend - Graphics |
| **xlsx** | Excel file parsing and generation | Frontend - Data Import/Export |
| **papaparse** | CSV parsing and processing | Frontend - CSV Processing |
| **express** | Backend web framework | Backend - Server |
| **mongoose** | MongoDB object modeling | Backend - Database |
| **@google/genai** | Google Gemini AI integration | Backend - AI Services |
| **vite** | Fast build tool and dev server | Dev - Build Tool |
| **eslint** | Code linting and quality checks | Dev - Code Quality |

> **Note**: All dependencies are managed through npm. Badges display the latest available versions from the npm registry. The project uses semantic versioning (^) for flexible updates within major versions. See `package.json` files for exact version constraints used in this project.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **npm** (v7.0.0 or higher)
- **MongoDB** (v4.4 or higher) - For data persistence across all features
- **Google Gemini AI API Key** (for AI-powered text extraction and notes generation)
- **LongCat API Key** (optional - for AI Assistant alternative models)
- **GitHub Personal Access Token** (optional - for GitHub Models: GPT-4o, Claude, etc.)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/H0NEYP0T-466/Pen2PDF.git
cd Pen2PDF
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Database Setup

Ensure MongoDB is running on your system. The application uses multiple databases:

```bash
# Start MongoDB service (varies by OS)
# macOS (with Homebrew): brew services start mongodb-community
# Ubuntu: sudo systemctl start mongod
# Windows: net start MongoDB
```

The application will automatically create the following databases:
- `todolist` - For todo management data
- `timetable` - For timetable and schedule data  
- `notes` - For notes and study materials
- `chat` - For AI assistant chat history

### 5. Environment Setup

Create a `.env` file in the `backend` directory:

```bash
cd backend
touch .env
```

Add your API keys to the `.env` file:

```env
# Required: Google Gemini API for text extraction and notes generation
GEMINI_API_KEY=your_google_gemini_api_key_here

# Optional: LongCat API for AI Assistant alternative models
LONGCAT_API_KEY=your_longcat_api_key_here

# Optional: GitHub Personal Access Token for GitHub Models (GPT-4o, Claude, etc.)
# Get your PAT from https://github.com/settings/tokens with model access scope
githubModelsPAT=your_github_pat_here
```

**GitHub Models Setup** (Optional):
To use GitHub Models (GPT-4o, GPT-4, Claude, etc.) in the AI Assistant:
1. Visit https://github.com/settings/tokens
2. Create a new Personal Access Token (classic)
   - The exact scope requirements may depend on your GitHub subscription
   - For GitHub Models access, your account needs GitHub Copilot or GitHub Models access
3. Ensure you have access to GitHub Models (included with GitHub Copilot or Student Developer Pack)
4. Copy the token and add it as `githubModelsPAT` in your `.env` file
5. The AI Assistant will automatically discover available models at runtime via the GitHub Models API

> **Note**: Without a GitHub PAT, the AI Assistant will still work with LongCat and Gemini models. GitHub Models will be shown as "unavailable" in the model selector.

### 6. Start the Development Servers

#### Backend Server (Terminal 1)
```bash
cd backend
node index.js
```

#### Frontend Server (Terminal 2)
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (frontend) and the backend API at `http://localhost:8000`.

## 💻 Usage

The Pen2PDF Suite provides six main productivity tools accessible from the landing page. Each tool is designed to handle specific aspects of your workflow:

### 📝 Pen2PDF - Document Conversion

1. **📤 Upload Files**: Drag and drop or click to upload PDF, PPT, PPTX, or image files
2. **🔄 Reorder Files**: Use the up/down arrows to arrange files in the desired order
3. **🤖 Extract Text**: Click "Extract All" to process files using AI text extraction
4. **✏️ Edit Content**: Use the markdown editor to refine and format the extracted text
5. **📄 Export**: Download as PDF or markdown file

#### File Format Support
| Format | Description | Notes |
|--------|-------------|-------|
| PDF | Portable Document Format | Supports text and image-based PDFs |
| PPT/PPTX | PowerPoint Presentations | Extract text from slides |
| PNG/JPG/WebP | Image Files | OCR text extraction from images |

### 📅 Timetable Management

1. **➕ Add Entries**: Create individual timetable entries with subject, teacher, room, and timing details
2. **📁 Import Data**: Upload CSV, XLSX, or XLS files with bulk timetable data
3. **📊 View Schedule**: Browse your organized weekly schedule
4. **✏️ Edit Entries**: Modify existing timetable entries as needed
5. **🗑️ Manage Data**: Delete individual entries or clear entire schedule

#### Import File Format
Your import file should contain these columns:
```
Subject Name, Teacher Name, Class Number, Class Type, Timings, Day
```

### ✅ TodoList Management

1. **📋 Create Cards**: Add new todo cards for different projects or categories
2. **➕ Add Subtasks**: Break down cards into specific actionable subtasks
3. **📌 Pin Important**: Pin high-priority subtasks for easy access
4. **✓ Track Progress**: Mark subtasks as completed to monitor progress
5. **📊 View Analytics**: See completion statistics and progress overview

### 📚 Notes Generation & Library

1. **📤 Upload Content**: Upload files (PDF, PPTX, etc.) for note generation
2. **🤖 Generate Notes**: AI creates structured study notes from your content
3. **✏️ Edit Notes**: Refine generated notes using the markdown editor
4. **💾 Save to Library**: Store notes in your personal notes library
5. **🔍 Browse Library**: Access and search through your saved notes collection
6. **📋 Blank Notes**: Create notes from scratch without file upload


### 🤖 AI Assistant (Bella) Usage

1. **💬 Start Chat**: Open AI Assistant from the landing page
2. **🔄 Select Model**: Choose from LongCat or Gemini models in the dropdown
   - LongCat models: Fast chat and thinking modes
   - Gemini models: Advanced AI with file upload support
3. **📎 Upload Files** (Gemini only): Click upload button to add files as context
4. **📚 Add Notes Context**: 
   - Open context panel
   - Search for relevant notes
   - Check notes to include them as context
5. **💬 Send Messages**: Type your message and press Enter or click Send
6. **🧠 Context-Aware Chat**: AI remembers your last 20 messages for better conversations
7. **📝 Rich Formatting**: AI responses render with markdown, code blocks, and LaTeX math
8. **💾 Conversation History**: Your chat is automatically saved and loaded on next visit
9. **🔄 Switch Models**: Change models anytime to suit your needs

### 🎯 Navigation

- **🏠 Landing Page**: Access all six tools from the main dashboard
- **🔙 Easy Return**: Navigate back to the main menu from any tool
- **📱 Mobile Friendly**: All features work seamlessly on mobile devices

## 📁 Project Structure

```
Pen2PDF/
├── 📁 public/                 # Static assets
│   └── favi.png              # Favicon
├── 📁 src/                   # Frontend source code
│   ├── App.jsx              # Main React application
│   ├── App.css              # Application styles
│   ├── main.jsx             # React entry point
│   ├── index.css            # Global styles
│   └── 📁 components/        # React components
│       ├── 📁 LandingPage/   # Main dashboard
│       │   ├── LandingPage.jsx
│       │   └── LandingPage.css
│       ├── 📁 Notes/         # Notes generation & library
│       │   ├── Notes.jsx
│       │   └── Notes.css
│       ├── 📁 Timetable/     # Schedule management
│       │   ├── Timetable.jsx
│       │   └── Timetable.css
│       ├── 📁 TodoList/      # Task management
│       │   ├── TodoList.jsx
│       │   └── TodoList.css
│       ├── 📁 AIAssistant/   # AI chat assistant
│       │   ├── AIAssistant.jsx
│       │   └── AIAssistant.css
│       └── 📁 WeekCounter/   # Week counter widget
│           ├── WeekCounter.jsx
│           └── WeekCounter.css
├── 📁 backend/               # Backend server
│   ├── 📁 controller/        # Request handlers
│   │   ├── controller.js     # Pen2PDF text extraction
│   │   ├── dbcontroller.js   # TodoList management
│   │   ├── timetableController.js  # Timetable management
│   │   ├── notesController.js      # Notes management
│   │   ├── whiteboardController.js # Whiteboard management
│   │   └── chatController.js       # Chat history management
│   ├── 📁 model/            # Database models
│   │   ├── todoData.js      # Todo data schema
│   │   ├── timetableData.js # Timetable data schema
│   │   ├── notesData.js     # Notes data schema
│   │   ├── whiteboardData.js # Whiteboard data schema
│   │   └── chatData.js      # Chat history schema
│   ├── 📁 config/           # Database configuration
│   │   └── database.js      # MongoDB connections
│   ├── 📁 gemini/           # Gemini AI integration
│   │   ├── gemini.js        # Pen2PDF text extraction
│   │   └── notesgemini.js   # Notes generation
│   ├── 📁 longcat/          # LongCat AI integration
│   │   └── longcat.js       # Chat API integration
│   ├── index.js             # Express server entry point
│   └── package.json         # Backend dependencies
├── 📄 README.md             # Project documentation
├── 📄 CHAT_CONTEXT_GUIDE.md # Chat context & formatting guide
├── 📄 TIMETABLE_IMPORT_GUIDE.md  # Timetable import guide
├── 📄 sample_timetable.csv  # Example timetable format
├── 📄 LICENSE               # MIT License
├── 📄 CONTRIBUTING.md       # Contribution guidelines
├── 📄 package.json          # Frontend dependencies
├── 📄 vite.config.js        # Vite configuration
├── 📄 eslint.config.js      # ESLint configuration
└── 📄 index.html            # HTML template
```

## 📦 Submodules

This project currently does not use any Git submodules. All dependencies are managed through npm package managers and are listed in the respective `package.json` files.

If you're looking to extend Pen2PDF with additional modules, please refer to our [Contributing Guidelines](CONTRIBUTING.md) for best practices on project architecture and integration.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on:

- 🔧 Setting up the development environment
- 📝 Code style and formatting requirements
- 🧪 Testing procedures
- 📋 Submitting pull requests
- 🐛 Reporting bugs
- 💡 Requesting features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🛡️ Security

We take security seriously. If you discover a security vulnerability, please see our [Security Policy](SECURITY.md) for information on how to report it responsibly.

## 📏 Code of Conduct

This project follows the Contributor Covenant Code of Conduct. Please read our [Code of Conduct](CODE_OF_CONDUCT.md) to understand the expected behavior when participating in our community.

## 🗺️ Roadmap

### ✅ Current Features
- **📝 Pen2PDF**: AI-powered text extraction using Google Gemini from multiple file formats
- **📅 Timetable**: Complete schedule management with Excel/CSV import functionality
- **✅ TodoList**: Task management with subtasks, pinning, and progress tracking
- **📚 Notes**: AI-powered notes generation and searchable notes library
- **🎨 Whiteboard**: Full-featured digital whiteboard with drawing, text, images, and export
- **🤖 AI Assistant (Bella)**: Multi-model AI chat with file upload and notes context
- **🎨 Unified Interface**: Consistent design across all productivity tools
- **📱 Responsive Design**: Full mobile and desktop compatibility
- **🔐 Data Persistence**: MongoDB integration for all features

### 🚧 In Development
- **🔄 Cross-feature Integration**: Link notes to specific timetable subjects and todo tasks
- **📊 Analytics Dashboard**: Usage statistics and productivity insights across all tools
- **🎯 Smart Suggestions**: AI-powered recommendations based on usage patterns
- **🔍 Global Search**: Search across all notes, todos, and timetable entries
- **📅 Calendar Integration**: Sync timetable with external calendar applications

### 🔮 Future Vision
- **☁️ Cloud Sync**: Multi-device synchronization and backup
- **👥 Collaboration**: Share timetables, notes, and todo lists with team members
- **📱 Mobile Apps**: Native iOS and Android applications
- **🔌 API Integrations**: Connect with popular productivity and educational tools
- **🎓 Academic Features**: GPA tracking, assignment deadlines, exam scheduling
- **🤖 Advanced AI**: Multi-provider AI support (OpenAI, Claude, etc.)
- **📈 Progress Analytics**: Detailed productivity metrics and goal tracking
- **🎨 Customization**: Themes, templates, and personalized workflows

## 🙏 Acknowledgements

- **Google Gemini AI** - Powering our intelligent text extraction
- **React Team** - For the amazing frontend framework
- **Vite** - For blazing fast development experience
- **html2pdf.js** - For client-side PDF generation
- **Marked** - For markdown parsing and rendering
- **Express.js** - For robust backend API development

---

<p align="center">Made with ❤️ by H0NEYP0T-466</p>
