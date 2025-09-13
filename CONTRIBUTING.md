# 🤝 Contributing to Pen2PDF

Thank you for your interest in contributing to Pen2PDF! We welcome contributions from developers of all skill levels. This guide will help you get started.

## 📋 Table of Contents

- [🚀 Getting Started](#-getting-started)
- [🔧 Development Setup](#-development-setup)
- [📝 Code Style Guidelines](#-code-style-guidelines)
- [🧪 Testing](#-testing)
- [📤 Submitting Changes](#-submitting-changes)
- [🐛 Bug Reports](#-bug-reports)
- [💡 Feature Requests](#-feature-requests)
- [📚 Documentation Updates](#-documentation-updates)
- [❓ Questions](#-questions)

## 🚀 Getting Started

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/Pen2PDF.git
   cd Pen2PDF
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/H0NEYP0T-466/Pen2PDF.git
   ```

### Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

## 🔧 Development Setup

### Prerequisites

- **Node.js** (v16.0.0 or higher)
- **npm** (v7.0.0 or higher)
- **Google Gemini AI API Key**

### Installation

1. **Install frontend dependencies**:
   ```bash
   npm install
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Setup environment variables**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

### Running the Development Servers

#### Backend (Terminal 1)
```bash
cd backend
npm run dev  # or node index.js
```

#### Frontend (Terminal 2)
```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 📝 Code Style Guidelines

### ESLint Configuration

We use ESLint for code quality and consistency. Run linting before submitting:

```bash
npm run lint
```

### Code Formatting

- **Indentation**: 2 spaces
- **Quotes**: Use double quotes for strings
- **Semicolons**: Required
- **Line Length**: Maximum 100 characters
- **Naming**: Use camelCase for variables and functions

### Component Structure (React)

```jsx
import React, { useState, useEffect } from 'react';
import './Component.css';

function ComponentName({ prop1, prop2 }) {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  const handleEvent = () => {
    // Event handler logic
  };

  return (
    <div className="component-name">
      {/* JSX content */}
    </div>
  );
}

export default ComponentName;
```

### Backend Code Style

```javascript
const express = require('express');

const functionName = async (req, res) => {
  try {
    // Function logic
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { functionName };
```

## 🧪 Testing

### Running Tests

Currently, the project uses manual testing. Automated testing setup is planned for future releases.

### Manual Testing Checklist

Before submitting a PR, please test:

- [ ] File upload functionality (PDF, PPT, PPTX, images)
- [ ] Text extraction from different file types
- [ ] Markdown editing features (headers, bold, text replacement)
- [ ] PDF export functionality
- [ ] Markdown export functionality
- [ ] Responsive design on different screen sizes
- [ ] Error handling for invalid files
- [ ] Backend API endpoints

### Testing New Features

1. **Test the happy path** - Normal usage scenario
2. **Test edge cases** - Empty files, large files, unsupported formats
3. **Test error scenarios** - Network failures, API errors
4. **Cross-browser testing** - Chrome, Firefox, Safari, Edge

## 📤 Submitting Changes

### Before Submitting

1. **Sync with upstream**:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Rebase your feature branch**:
   ```bash
   git checkout feature/your-feature-name
   git rebase main
   ```

3. **Run linting and tests**:
   ```bash
   npm run lint
   # Manual testing as described above
   ```

### Pull Request Guidelines

1. **Clear title and description**:
   - Use descriptive titles: "Add drag-and-drop file upload" instead of "Update upload"
   - Include motivation and context in the description
   - Reference related issues: "Fixes #123"

2. **Small, focused changes**:
   - One feature or fix per PR
   - Keep PRs under 400 lines when possible
   - Split large changes into multiple PRs

3. **Include screenshots** for UI changes

4. **Update documentation** if needed

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested manually
- [ ] Added/updated tests
- [ ] Cross-browser tested

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or marked as such)
```

## 🐛 Bug Reports

### Before Reporting

1. **Search existing issues** to avoid duplicates
2. **Test on the latest version**
3. **Try to reproduce** the issue

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. Windows 10, macOS 11.0]
- Browser: [e.g. Chrome 91, Firefox 89]
- Version: [e.g. 1.0.0]

**Additional context**
Any other context about the problem.
```

## 💡 Feature Requests

### Before Requesting

1. **Check existing issues** and discussions
2. **Consider the scope** - Does it fit the project goals?
3. **Think about implementation** - How would this work?

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Any other context, mockups, or examples.
```

## 📚 Documentation Updates

Documentation improvements are always welcome!

### Areas that need documentation:
- API documentation
- Setup guides for different operating systems
- Troubleshooting guides
- Feature tutorials
- Code comments and inline documentation

### Documentation Style

- Use clear, concise language
- Include code examples
- Add screenshots for UI instructions
- Keep it up-to-date with code changes

## ❓ Questions

### Where to Ask

- **General questions**: [GitHub Discussions](https://github.com/H0NEYP0T-466/Pen2PDF/discussions)
- **Bug reports**: [GitHub Issues](https://github.com/H0NEYP0T-466/Pen2PDF/issues)
- **Feature requests**: [GitHub Issues](https://github.com/H0NEYP0T-466/Pen2PDF/issues)

### Getting Help

1. **Search existing discussions and issues**
2. **Provide context** when asking questions
3. **Include relevant code snippets**
4. **Be patient and respectful**

---

## 🙏 Thank You

Every contribution helps make Pen2PDF better! Whether it's:

- 🐛 Reporting bugs
- 💡 Suggesting features
- 📝 Improving documentation
- 💻 Writing code
- 🧪 Testing
- 📢 Spreading the word

Your involvement is appreciated! 🎉

---

<div align="center">

**Happy Contributing! 🚀**

Made with ❤️ by the Pen2PDF community

</div>