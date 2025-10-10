# Visual: AI Model Integration Refactor

## Model Count Reduction

### Before Refactor
```
┌─────────────────────────────────────────────────────────┐
│                  GEMINI MODELS (6 total)                │
├─────────────────────────────────────────────────────────┤
│  Text Extraction (gemini.js)                            │
│  ┌────────────────────────────────────────────────┐    │
│  │ 1. gemini-2.5-flash-latest                     │    │
│  │ 2. gemini-2.5-pro-latest                       │    │
│  │ 3. gemini-2.5-flash-002                        │    │
│  │ 4. gemini-2.5-pro-002                          │    │
│  │ 5. gemini-2.0-flash-exp                        │    │
│  │ 6. gemini-2.0-flash-lite                       │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Notes Generation (notesgemini.js)                      │
│  ┌────────────────────────────────────────────────┐    │
│  │ 1. gemini-2.5-pro-latest                       │    │
│  │ 2. gemini-2.5-flash-latest                     │    │
│  │ 3. gemini-2.5-pro-002                          │    │
│  │ 4. gemini-2.5-flash-002                        │    │
│  │ 5. gemini-2.0-flash-exp                        │    │
│  │ 6. gemini-2.0-flash-lite                       │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  AI Assistant (chatController.js + AIAssistant.jsx)     │
│  ┌────────────────────────────────────────────────┐    │
│  │ Longcat:                                       │    │
│  │ 1. longcat-flash-chat                          │    │
│  │ 2. longcat-flash-thinking                      │    │
│  │                                                │    │
│  │ Gemini:                                        │    │
│  │ 3. gemini-2.5-pro-latest                       │    │
│  │ 4. gemini-2.5-flash-latest                     │    │
│  │ 5. gemini-2.5-flash-002                        │    │
│  │ 6. gemini-2.0-flash-exp                        │    │
│  │ 7. gemini-2.0-flash-lite                       │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Total in UI: 7 models (2 Longcat + 5 Gemini)          │
└─────────────────────────────────────────────────────────┘
```

### After Refactor ✅
```
┌─────────────────────────────────────────────────────────┐
│                  GEMINI MODELS (2 total)                │
├─────────────────────────────────────────────────────────┤
│  Text Extraction (gemini.js)                            │
│  ┌────────────────────────────────────────────────┐    │
│  │ PRIMARY:  gemini-2.5-flash   (fast)            │    │
│  │ FALLBACK: gemini-2.5-pro     (accurate)        │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Notes Generation (notesgemini.js)                      │
│  ┌────────────────────────────────────────────────┐    │
│  │ PRIMARY:  gemini-2.5-pro     (quality)         │    │
│  │ FALLBACK: gemini-2.5-flash   (fast)            │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  AI Assistant (chatController.js + AIAssistant.jsx)     │
│  ┌────────────────────────────────────────────────┐    │
│  │ Longcat:                                       │    │
│  │ 1. longcat-flash-chat                          │    │
│  │ 2. longcat-flash-thinking                      │    │
│  │                                                │    │
│  │ Gemini (with automatic fallback):              │    │
│  │ 3. gemini-2.5-pro      ↔ gemini-2.5-flash     │    │
│  │ 4. gemini-2.5-flash    ↔ gemini-2.5-pro       │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Total in UI: 4 models (2 Longcat + 2 Gemini) ✅       │
└─────────────────────────────────────────────────────────┘
```

**Reduction:** 7 → 4 models in UI (-43%)
**Gemini Models:** 5 → 2 models (-60%)

---

## Code Structure Change

### Before: Separate Fallback Loops
```javascript
// gemini.js
const CANDIDATE_MODELS = [
  "gemini-2.5-flash-latest",
  "gemini-2.5-pro-latest",
  "gemini-2.5-flash-002",
  "gemini-2.5-pro-002",
  "gemini-2.0-flash-exp",
  "gemini-2.0-flash-lite"
];

for (const model of CANDIDATE_MODELS) {
  try {
    // ... API call
  } catch (err) {
    // ... error handling
  }
}
```

```javascript
// notesgemini.js
const CANDIDATE_MODELS = [
  "gemini-2.5-pro-latest",
  "gemini-2.5-flash-latest",
  "gemini-2.5-pro-002",
  "gemini-2.5-flash-002",
  "gemini-2.0-flash-exp",
  "gemini-2.0-flash-lite"
];

for (const model of CANDIDATE_MODELS) {
  try {
    // ... API call
  } catch (err) {
    // ... error handling
  }
}
```

```javascript
// chatController.js
// No fallback - direct call
const response = await ai.models.generateContent({
  model: model,
  contents: parts,
  config: { systemInstruction }
});
```

### After: Centralized Helper Function ✅
```javascript
// Shared in gemini.js and notesgemini.js
async function callGeminiAPI(
  primaryModel,
  fallbackModel,
  parts,
  systemInstruction,
  logPrefix
) {
  const models = [primaryModel, fallbackModel];
  
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      console.log(`🔄 ${logPrefix} Attempting ${model}...`);
      const response = await ai.models.generateContent({...});
      console.log(`✅ ${logPrefix} ${model} responded successfully.`);
      return text;
    } catch (err) {
      // Detect: 403, 429, 503, 404
      if (isRetryable && isPrimary) {
        console.log(`⏳ ${logPrefix} Model ${model} quota reached, retrying ${fallbackModel}...`);
        continue;
      }
    }
  }
}

// Usage
const text = await callGeminiAPI(
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  parts,
  systemInstruction,
  "[GEMINI TEXT]"
);
```

---

## Fallback Flow Diagram

### Text Extraction
```
User uploads PDF/image
        ↓
┌───────────────────────┐
│ Try gemini-2.5-flash  │ ← PRIMARY (fast)
└───────────────────────┘
        ↓
   Success? ────── YES ──→ Return extracted text ✅
        │
        NO (403/429/503/404)
        ↓
┌───────────────────────┐
│ Try gemini-2.5-pro    │ ← FALLBACK (accurate)
└───────────────────────┘
        ↓
   Success? ────── YES ──→ Return extracted text ✅
        │
        NO
        ↓
    Throw error ❌
```

### Notes Generation
```
User uploads lecture slides
        ↓
┌───────────────────────┐
│ Try gemini-2.5-pro    │ ← PRIMARY (quality)
└───────────────────────┘
        ↓
   Success? ────── YES ──→ Return generated notes ✅
        │
        NO (403/429/503/404)
        ↓
┌───────────────────────┐
│ Try gemini-2.5-flash  │ ← FALLBACK (fast)
└───────────────────────┘
        ↓
   Success? ────── YES ──→ Return generated notes ✅
        │
        NO
        ↓
    Throw error ❌
```

### AI Assistant Chat
```
User sends message with gemini-2.5-pro selected
        ↓
┌───────────────────────┐
│ Try gemini-2.5-pro    │ ← SELECTED by user
└───────────────────────┘
        ↓
   Success? ────── YES ──→ Return chat response ✅
        │
        NO (403/429/503/404)
        ↓
┌───────────────────────┐
│ Try gemini-2.5-flash  │ ← AUTOMATIC FALLBACK
└───────────────────────┘
        ↓
   Success? ────── YES ──→ Return chat response ✅
        │                   (User sees success!)
        NO
        ↓
    Return error message
    (User can manually switch models)
```

---

## Error Detection Improvements

### Before
```javascript
// Only checked 429 and 503
const isRateLimit = code === 429 || msg.includes("quota");
const isServiceUnavailable = code === 503 || msg.includes("overloaded");
```

### After ✅
```javascript
// Checks 403, 429, 503, 404
const isQuotaError = code === 429 || msg.includes("quota");
const isNotFound = code === 404 || msg.includes("not found");
const isForbidden = code === 403;
const isServiceUnavailable = code === 503 || msg.includes("unavailable");

const isRetryable = isQuotaError || isNotFound || isForbidden || isServiceUnavailable;

// Descriptive logging
if (isQuotaError) {
  console.log(`⏳ Model ${model} quota reached, retrying ${fallbackModel}...`);
} else if (isForbidden) {
  console.log(`🚫 Model ${model} access forbidden (403), retrying ${fallbackModel}...`);
} else if (isNotFound) {
  console.log(`🔍 Model ${model} not found (404), retrying ${fallbackModel}...`);
} else if (isServiceUnavailable) {
  console.log(`⚠️ Model ${model} service unavailable (503), retrying ${fallbackModel}...`);
}
```

---

## Summary

| Aspect | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Gemini Models** | 6 | 2 | 67% reduction |
| **UI Models** | 7 | 4 | 43% reduction |
| **Code Duplication** | High | Low | Centralized |
| **Error Types** | 2 | 4 | 100% more |
| **Fallback** | Text/Notes | Text/Notes/Chat | +Chat |
| **Logging** | Basic | Descriptive | Improved |
| **Maintainability** | Medium | High | Better |
