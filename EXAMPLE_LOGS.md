# Example Server Logs

This document shows what the server console will display when different features are used.

## Example 1: Chatbot with Context Notes

When a user sends a message to the chatbot with context notes included:

```
📡 [API] POST /api/chat/message
📦 [API] Body: {"message":"What are neural networks?","model":"gemini-2.5-flash","contextNotes":[{"title":"AI Basics","content":"..."}]}

================================================================================
🤖 [CHATBOT] User accessed chatbot
📊 [CHATBOT] Model requested: gemini-2.5-flash
💬 [CHATBOT] User query: What are neural networks?
📝 [CHATBOT] Creating new chat session
📚 [CHATBOT] Context window size: 0 messages
📄 [CHATBOT] Context notes included: 1 notes
   📌 Note 1: AI Basics (500 chars)
🔄 [CHATBOT] Using Gemini API
📋 [GEMINI] Full prompt being sent to model:
────────────────────────────────────────────────────────────────────────────────

Context from notes:

--- AI Basics ---
[Full context content here]

User question: What are neural networks?
────────────────────────────────────────────────────────────────────────────────
🚀 [GEMINI] Sending request to model: gemini-2.5-flash
📨 [GEMINI] Complete response from model:
────────────────────────────────────────────────────────────────────────────────
Neural networks are a fundamental concept in artificial intelligence...
[Full response here]
────────────────────────────────────────────────────────────────────────────────
📤 [CHATBOT] Model response received (length: 650 chars)
📝 [CHATBOT] Response preview: Neural networks are a fundamental concept in artificial intelligence that mimics the way human brains process information. They consist of interconnected nodes (neurons) organized in layers...
✅ [CHATBOT] Response sent successfully using model: gemini-2.5-flash
================================================================================
```

## Example 2: LongCat API Call

When using a LongCat model:

```
📡 [API] POST /api/chat/message
📦 [API] Body: {"message":"Explain quantum computing","model":"longcat/llama-3.3-70b"}

================================================================================
🤖 [CHATBOT] User accessed chatbot
📊 [CHATBOT] Model requested: longcat/llama-3.3-70b
💬 [CHATBOT] User query: Explain quantum computing
📚 [CHATBOT] Context window size: 2 messages
🔄 [CHATBOT] Using LongCat API
📋 [LONGCAT] Full prompt being sent to model:
────────────────────────────────────────────────────────────────────────────────
Message 1 (system):
You are Bella, a helpful AI assistant integrated into the Pen2PDF productivity suite. You help users with their questions, provide insights from their notes, and assist with various tasks. Be concise, helpful, and friendly.
────────────────────────────────────────────
Message 2 (system):
Here is your previous chat with the user:

User: Hello
Bella: Hi! How can I help you today?

Now respond to their current message below.
────────────────────────────────────────────
Message 3 (user):
Explain quantum computing
────────────────────────────────────────────────────────────────────────────────
🚀 [LONGCAT] Sending request to model: longcat/llama-3.3-70b
🌐 [LONGCAT] API endpoint: https://api.longcat.chat/openai/v1/chat/completions
📨 [LONGCAT] Complete response from model:
────────────────────────────────────────────────────────────────────────────────
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "longcat/llama-3.3-70b",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Quantum computing is a revolutionary approach to computation..."
      },
      "finish_reason": "stop"
    }
  ]
}
────────────────────────────────────────────────────────────────────────────────
✅ [LONGCAT] Response content extracted successfully
📤 [CHATBOT] Model response received (length: 580 chars)
📝 [CHATBOT] Response preview: Quantum computing is a revolutionary approach to computation that leverages the principles of quantum mechanics to process information in fundamentally different ways...
✅ [CHATBOT] Response sent successfully using model: longcat/llama-3.3-70b
================================================================================
```

## Example 3: Notes Generation from Files

When generating notes from uploaded files:

```
📡 [API] POST /notesGenerate

================================================================================
📚 [NOTES GENERATION] Notes generation request received
📁 [NOTES GENERATION] Processing 2 file(s):
   📄 lecture_slides.pdf (application/pdf, 1245.67 KB)
   📄 textbook_chapter.txt (text/plain, 45.23 KB)
   📝 Text content length: 12500 characters
🚀 [NOTES GENERATION] Sending to Gemini API for processing...
🔄 [GEMINI NOTES] Starting notes generation with model fallback strategy

🔄 [GEMINI NOTES] Trying model: gemini-2.5-pro

✅ [GEMINI NOTES] Notes generation successful using model: gemini-2.5-pro
📊 [GEMINI NOTES] Generated content length: 8900 characters
✅ [NOTES GENERATION] Notes generated successfully
📊 [NOTES GENERATION] Model used: gemini-2.5-pro
📝 [NOTES GENERATION] Generated content length: 8900 characters
================================================================================
```

## Example 4: Text Extraction

When extracting text from an image or document:

```
📡 [API] POST /textExtract

================================================================================
📄 [TEXT EXTRACT] Text extraction request received
📁 [TEXT EXTRACT] File: handwritten_notes.jpg
📊 [TEXT EXTRACT] Type: image/jpeg
📏 [TEXT EXTRACT] Size: 256.89 KB
🚀 [TEXT EXTRACT] Sending to Gemini API for extraction...
🔄 [GEMINI TEXT] Starting text extraction with model fallback strategy

🔄 [GEMINI TEXT] Trying model: gemini-2.5-flash

✅ [GEMINI TEXT] Text extraction successful using model: gemini-2.5-flash
📊 [GEMINI TEXT] Extracted text length: 1500 characters
✅ [TEXT EXTRACT] Text extracted successfully
📝 [TEXT EXTRACT] Extracted text length: 1500 characters
================================================================================
```

## Example 5: Model Fallback (Rate Limit)

When hitting rate limits and falling back to another model:

```
🔄 [GEMINI NOTES] Starting notes generation with model fallback strategy

🔄 [GEMINI NOTES] Trying model: gemini-2.5-pro
❌ [GEMINI NOTES] Model gemini-2.5-pro failed: Resource has been exhausted (e.g. check quota)
⏳ [GEMINI NOTES] Rate limit hit for gemini-2.5-pro, trying next model...

🔄 [GEMINI NOTES] Trying model: gemini-2.5-flash
❌ [GEMINI NOTES] Model gemini-2.5-flash failed: Resource has been exhausted (e.g. check quota)
⏳ [GEMINI NOTES] Rate limit hit for gemini-2.5-flash, trying next model...

🔄 [GEMINI NOTES] Trying model: gemini-2.0-flash

✅ [GEMINI NOTES] Notes generation successful using model: gemini-2.0-flash
📊 [GEMINI NOTES] Generated content length: 8900 characters
```

## Example 6: Notes CRUD Operations

### Get All Notes
```
📡 [API] GET /api/notes

📥 [NOTES] Get all notes request received
✅ [NOTES] Retrieved 15 notes successfully
```

### Create Note
```
📡 [API] POST /api/notes
📦 [API] Body: {"title":"Machine Learning Basics","originalFiles":["ml_lecture.pdf"],...}

📝 [NOTES] Create notes request received
   Title: Machine Learning Basics
   Files: 1
   Model: gemini-2.5-pro
✅ [NOTES] Notes saved successfully with ID: 507f1f77bcf86cd799439011
```

### Delete Note
```
📡 [API] DELETE /api/notes/507f1f77bcf86cd799439011

🗑️  [NOTES] Delete notes request for ID: 507f1f77bcf86cd799439011
✅ [NOTES] Notes deleted successfully
```

## Example 7: Chat History Operations

### Get Chat History
```
📡 [API] GET /api/chat

📥 [CHAT] Get chat history request received
📚 [CHAT] Retrieved chat history with 25 messages
✅ [CHAT] Chat history sent successfully
```

### Clear Chat History
```
📡 [API] DELETE /api/chat

🗑️  [CHAT] Clear chat history request received
✅ [CHAT] Chat history cleared (25 messages removed)
```

## Viewing Logs

To see these logs in real-time:

1. Start the backend server:
   ```bash
   cd backend
   node index.js
   ```

2. Use the application features (chatbot, notes generation, etc.)

3. Watch the server console for detailed logs

All logs use emojis and prefixes for easy identification:
- 📡 API requests
- 🤖 Chatbot
- 📚 Notes
- 📄 Text extraction
- ✅ Success
- ❌ Error
- 🔄 Processing
