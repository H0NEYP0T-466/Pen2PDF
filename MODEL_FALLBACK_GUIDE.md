# Model Fallback Strategy Quick Reference

## Text Extraction (gemini.js)
**Use Case:** Extract text from PDFs, images, scanned documents

**Priority Order:**
1. ⚡ `gemini-1.5-flash` - Fast extraction
2. 🎯 `gemini-1.5-pro` - Accurate extraction  
3. 🧪 `gemini-2.0-flash-exp` - Experimental

**Strategy:** Speed first, then accuracy

---

## Notes Generation (notesgemini.js)
**Use Case:** Generate study notes from uploaded materials

**Priority Order:**
1. 🎯 `gemini-1.5-pro` - Best quality
2. ⚡ `gemini-1.5-flash` - Fast generation
3. 🧪 `gemini-2.0-flash-exp` - Experimental

**Strategy:** Quality first, then speed

---

## AI Assistant (chatController.js)
**Use Case:** Chat with Bella AI assistant

**Available Models (user-selectable):**
- 🐱 `longcat-flash-chat` - LongCat Chat (no files)
- 🐱 `longcat-flash-thinking` - LongCat Thinking (no files)
- 🎯 `gemini-1.5-pro` - **Default** - Best responses (files ✓)
- ⚡ `gemini-1.5-flash` - Fast responses (files ✓)
- ⚡ `gemini-1.5-flash-8b` - Fastest responses (files ✓)
- 🧪 `gemini-2.0-flash-exp` - Experimental (files ✓)

**Strategy:** No auto-fallback - user manually switches models if quota exceeded

---

## Error Handling

### Quota/Rate Limit Errors
When a model hits quota or rate limits:
- **Text/Notes:** Automatically tries next model in priority list
- **AI Assistant:** Shows error message, user can switch models manually

### Server Behavior
- ✅ Server never crashes on model errors
- ✅ Error messages displayed to user
- ✅ User can immediately try different model
- ✅ Chat history preserved even on errors

### Error Messages
```
⚠️ Model "gemini-1.5-pro" has reached its quota or rate limit.
Please try a different model or wait a few moments before trying again.
```

---

## Model Characteristics

| Model | Speed | Quality | Cost | Best For |
|-------|-------|---------|------|----------|
| gemini-1.5-pro | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 💰💰💰 | Complex tasks, notes generation |
| gemini-1.5-flash | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 💰💰 | Text extraction, quick responses |
| gemini-1.5-flash-8b | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 💰 | Ultra-fast simple tasks |
| gemini-2.0-flash-exp | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 💰 | Experimental features |

---

## When Models Are Used

### Automatic (with fallback)
- **Upload PDF for text extraction** → Uses Text Extraction priority
- **Generate notes from files** → Uses Notes Generation priority

### Manual Selection
- **Chat with AI Assistant** → User picks model from dropdown
- Can switch anytime if quota exceeded
- File uploads only work with Gemini models (not LongCat)

---

## Troubleshooting

### "Quota exceeded" error
1. Try next model in list (auto-happens for text/notes)
2. For AI Assistant: manually select different model
3. Wait a few minutes and retry
4. Use flash-8b for simpler/faster tasks

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
