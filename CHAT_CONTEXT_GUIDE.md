# Chat Context Window Feature Guide

## Overview
This guide explains the new chat context window feature that allows AI models to remember previous conversations.

## What's New

### 1. Organized LongCat Folder Structure
```
backend/
├── gemini/          # Gemini AI integration
│   ├── gemini.js
│   └── notesgemini.js
└── longcat/         # LongCat AI integration (NEW)
    └── longcat.js
```

The LongCat API integration is now organized in its own folder, similar to the Gemini integration.

### 2. Chat Context Window (Last 20 Messages)

Both Gemini and LongCat models now receive the last 20 messages from the conversation history as context. This allows the AI to:
- Remember previous questions and answers
- Provide more coherent and contextual responses
- Maintain continuity in conversations
- Reference earlier parts of the conversation

#### How It Works

1. **Message Storage**: All messages are stored in the database with role (user/assistant) and content
2. **Context Window**: When sending a new message, the system fetches the last 20 messages
3. **Prompt Format**: The messages are formatted and sent to the AI with this structure:

```
Here is your previous chat with the user:

User: [previous message 1]
Bella: [previous response 1]
User: [previous message 2]
Bella: [previous response 2]
...

Now respond to their current message below.

User question: [current message]
```

### 3. Enhanced UI - Markdown and LaTeX Rendering

The chat UI now properly renders:

#### Markdown Support
- **Headings** (H1-H6)
- **Bold** and *italic* text
- `Inline code`
- Code blocks with syntax highlighting
- Lists (ordered and unordered)
- Blockquotes
- Tables
- Links

#### LaTeX Math Support
- Inline math: `$E = mc^2$`
- Display math: `$$\int_{a}^{b} f(x) dx$$`
- Complex equations and formulas
- Matrices and symbols

#### CLI-Style Interface
- Dark terminal-like theme
- Monospace fonts
- Syntax-highlighted code blocks
- Responsive design

## Example Usage

### Simple Conversation with Context
```
User: What is Python?
Bella: Python is a high-level programming language...

User: Can you give me an example?
Bella: [References previous message about Python] Sure! Here's a simple Python example...

User: How do I run that?
Bella: [Remembers the example shared] To run the Python code I showed you...
```

### Math and Code Rendering
The AI can now respond with properly formatted content:

**Markdown Code Block:**
````markdown
```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
```
````

**LaTeX Math:**
```
The quadratic formula is: $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$
```

## Technical Details

### Backend Changes

1. **`backend/longcat/longcat.js`** (NEW)
   - Extracted LongCat API logic
   - Added chat history parameter
   - Formats context window for API

2. **`backend/controller/chatController.js`** (UPDATED)
   - Imports LongCat module
   - Fetches last 20 messages before each request
   - Passes context to both Gemini and LongCat functions

### Frontend Changes

1. **`src/components/AIAssistant/AIAssistant.jsx`** (UPDATED)
   - Added `marked` and `marked-katex-extension` imports
   - Configured KaTeX for LaTeX rendering
   - Added `renderMarkdown()` function
   - Updated message content to use `dangerouslySetInnerHTML`

2. **`src/components/AIAssistant/AIAssistant.css`** (UPDATED)
   - Added comprehensive markdown styling
   - Enhanced code block appearance
   - Added LaTeX/KaTeX styling
   - Improved CLI-like aesthetics

## Configuration

No additional configuration is required. The feature works automatically with existing API keys:

```env
# .env file
GEMINI_API_KEY=your_gemini_key
LONGCAT_API_KEY=your_longcat_key
```

## Benefits

1. **Better Conversations**: AI remembers context from up to 20 previous messages
2. **Improved Responses**: More relevant and coherent answers
3. **Rich Formatting**: Beautiful rendering of code, math, and text
4. **Professional UI**: CLI-style interface that's easy to read

## Testing

To test the new features:

1. **Context Window Test**:
   - Ask a question
   - Ask a follow-up that requires remembering the first question
   - Verify the AI references previous context

2. **Markdown Test**:
   - Ask the AI to write code examples
   - Verify syntax highlighting works

3. **LaTeX Test**:
   - Ask for math formulas
   - Verify equations render properly (not raw LaTeX)

## Future Improvements

Potential enhancements:
- Adjustable context window size (user preference)
- Smart context selection (most relevant messages)
- Context window indicators in UI
- Export chat with formatting intact
