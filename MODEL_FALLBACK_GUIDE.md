# Model Fallback Strategy Quick Reference

## Text Extraction (gemini.js)
**Use Case:** Extract text from PDFs, images, scanned documents

**Fallback Strategy:**
1. ⚡ `gemini-2.5-flash` - Primary (Fast extraction)
2. 🎯 `gemini-2.5-pro` - Fallback (Accurate extraction)

**Strategy:** Speed first for text extraction. If primary fails due to quota (403, 429, 503, NOT_FOUND), automatically retry with fallback.

---

## Notes Generation (notesgemini.js)
**Use Case:** Generate study notes from uploaded materials

**Fallback Strategy:**
1. 🎯 `gemini-2.5-pro` - Primary (Best quality)
2. ⚡ `gemini-2.5-flash` - Fallback (Fast generation)

**Strategy:** Quality first for notes. If primary fails due to quota (403, 429, 503, NOT_FOUND), automatically retry with fallback.

---

## AI Assistant (chatController.js)
**Use Case:** Chat with Bella AI assistant

**Available Models (user-selectable):**
- 🐱 `longcat-flash-chat` - LongCat Chat (no files)
- 🐱 `longcat-flash-thinking` - LongCat Thinking (no files)
- 🎯 `gemini-2.5-pro` - **Default** - Best responses (files ✓)
- ⚡ `gemini-2.5-flash` - Fast responses (files ✓)

**Total: 4 models (2 Longcat + 2 Gemini)**

**Fallback Strategy:** 
- For `gemini-2.5-pro`: Falls back to `gemini-2.5-flash` if quota exceeded
- For `gemini-2.5-flash`: Falls back to `gemini-2.5-pro` if quota exceeded
- Automatic fallback on errors: 403, 429, 503, NOT_FOUND

---

## Error Handling

### Retryable Errors with Fallback
- **403 Forbidden:** Access denied, try fallback model
- **429 Quota Exceeded:** Rate limit reached, try fallback model
- **503 Service Unavailable:** Model overloaded, try fallback model
- **404 NOT_FOUND:** Model not available, try fallback model

### Fallback Log Examples
```
[GEMINI] Attempting gemini-2.5-pro...
[GEMINI] Model gemini-2.5-pro quota reached or unavailable, retrying gemini-2.5-flash...
[GEMINI] gemini-2.5-flash responded successfully.
```

### Server Behavior
- ✅ Server never crashes on model errors
- ✅ Error messages displayed to user
- ✅ Automatic fallback for text extraction and notes
- ✅ Automatic fallback for AI assistant chat
- ✅ Chat history preserved even on errors

---

## Model Characteristics

| Model | Speed | Quality | Best For |
|-------|-------|---------|----------|
| gemini-2.5-pro | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Complex tasks, notes generation |
| gemini-2.5-flash | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Text extraction, quick responses |
| longcat-flash-chat | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Chat without files |
| longcat-flash-thinking | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Complex reasoning without files |

---

## When Models Are Used

### Automatic (with fallback)
- **Upload PDF for text extraction** → Primary: gemini-2.5-flash, Fallback: gemini-2.5-pro
- **Generate notes from files** → Primary: gemini-2.5-pro, Fallback: gemini-2.5-flash
- **Chat with AI Assistant** → User selects model, automatic fallback if needed

### Manual Selection
- **Chat with AI Assistant** → User picks from 4 models in dropdown
- Can switch anytime if quota exceeded
- File uploads only work with Gemini models (not LongCat)

---

## Troubleshooting

### "Quota exceeded" error
1. System automatically tries fallback model (for text/notes/chat)
2. If both models fail, user sees error message
3. Wait a few minutes and retry
4. Switch to different model manually

### Model not responding
1. Check internet connection
2. Verify API key is set in .env
3. Try different model
4. Check server logs for detailed error

### Server crash
This should never happen! If it does:
1. Check server logs
2. Report the issue
3. The error handling should prevent crashes
