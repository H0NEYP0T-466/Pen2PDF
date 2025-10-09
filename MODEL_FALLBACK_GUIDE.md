# Model Fallback Strategy Quick Reference

## Text Extraction (gemini.js)
**Use Case:** Extract text from PDFs, images, scanned documents

**Priority Order:**
1. ⚡ `gemini-2.5-flash-latest` - Fast extraction
2. 🎯 `gemini-2.5-pro-latest` - Accurate extraction  
3. ⚡ `gemini-2.5-flash-002` - Stable fast
4. 🎯 `gemini-2.5-pro-002` - Stable accurate
5. 🧪 `gemini-2.0-flash-exp` - Experimental
6. 🪶 `gemini-2.0-flash-lite` - Lightweight

**Strategy:** Speed first, then accuracy

---

## Notes Generation (notesgemini.js)
**Use Case:** Generate study notes from uploaded materials

**Priority Order:**
1. 🎯 `gemini-2.5-pro-latest` - Best quality
2. ⚡ `gemini-2.5-flash-latest` - Fast generation
3. 🎯 `gemini-2.5-pro-002` - Stable quality
4. ⚡ `gemini-2.5-flash-002` - Stable fast
5. 🧪 `gemini-2.0-flash-exp` - Experimental
6. 🪶 `gemini-2.0-flash-lite` - Lightweight

**Strategy:** Quality first, then speed

---

## AI Assistant (chatController.js)
**Use Case:** Chat with Bella AI assistant

**Available Models (user-selectable):**
- 🐱 `longcat-flash-chat` - LongCat Chat (no files)
- 🐱 `longcat-flash-thinking` - LongCat Thinking (no files)
- 🎯 `gemini-2.5-pro-latest` - **Default** - Best responses (files ✓)
- ⚡ `gemini-2.5-flash-latest` - Fast responses (files ✓)
- ⚡ `gemini-2.5-flash-002` - Stable fast (files ✓)
- 🧪 `gemini-2.0-flash-exp` - Experimental (files ✓)
- 🪶 `gemini-2.0-flash-lite` - Lightweight (files ✓)

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
⚠️ Model "gemini-2.5-pro-latest" has reached its quota or rate limit.
Please try a different model or wait a few moments before trying again.
```

---

## Model Characteristics

| Model | Speed | Quality | Cost | Best For |
|-------|-------|---------|------|----------|
| gemini-2.5-pro-latest | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 💰💰💰 | Complex tasks, notes generation |
| gemini-2.5-flash-latest | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 💰💰 | Text extraction, quick responses |
| gemini-2.5-flash-002 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 💰💰 | Stable version of flash |
| gemini-2.5-pro-002 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 💰💰💰 | Stable version of pro |
| gemini-2.0-flash-exp | ⭐⭐⭐⭐ | ⭐⭐⭐ | 💰 | Experimental features |
| gemini-2.0-flash-lite | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 💰 | Simple tasks, low quota |

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
4. Use lite version for simpler tasks

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
