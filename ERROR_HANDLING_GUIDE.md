# Error Handling Guide

## Overview
This document describes how the application handles errors when Gemini API quota is reached or services are unavailable, ensuring the server never crashes.

## Error Handling Architecture

### 1. Multi-Model Fallback Strategy

The application uses a fallback strategy with multiple Gemini models:

```javascript
const CANDIDATE_MODELS = [
  "gemini-2.0-flash-exp",
  "gemini-2.5-pro",           // New model added
  "gemini-1.5-flash-002",
  "gemini-1.5-flash-001",
  "gemini-1.5-pro-002",
  "gemini-1.5-pro-001"
];
```

### 2. Error Detection and Logging

#### Quota/Rate Limit Detection
```javascript
const isRateLimit = code === 429 || 
                   msg.includes("quota") || 
                   msg.includes("rate limit");

if (isRateLimit) {
  console.log(`⏳ [GEMINI] Rate limit hit for ${model}, trying next model...`);
}
```

#### Service Unavailability Detection
```javascript
const isServiceUnavailable = code === 503 || 
                             msg.includes("overloaded") || 
                             msg.includes("unavailable");

if (isServiceUnavailable) {
  console.log(`⚠️ [GEMINI] Model ${model} is overloaded/unavailable, trying next model...`);
}
```

### 3. Error Flow

1. **Model Attempt**: Try to call Gemini API with current model
2. **Error Detection**: Catch any errors and analyze the error code/message
3. **Error Logging**: Log detailed error information to console
   ```javascript
   console.error(`❌ [GEMINI] Model ${model} failed:`, {
     message: err?.message,
     status: err?.status || err?.code,
     stack: err?.stack
   });
   ```
4. **Fallback Decision**: 
   - If quota/rate limit or service unavailable → Try next model
   - If non-retryable error → Stop trying and throw error
5. **Final Error Handling**: If all models fail, return error to user (server doesn't crash)

### 4. Server Stability

All routes have try-catch blocks to prevent server crashes:

```javascript
const sendMessage = async (req, res) => {
  try {
    // ... API calls
  } catch (error) {
    console.error('❌ [CHATBOT] Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};
```

### 5. User Experience

When errors occur:
- Server logs detailed error information for debugging
- User receives informative error message via API response
- Server continues running (no crashes)
- User can select different models manually

## Log Output Examples

### When Quota is Reached
```
❌ [GEMINI TEXT] Model gemini-2.0-flash-exp failed: { message: 'Quota exceeded', status: 429 }
⏳ [GEMINI TEXT] Rate limit hit for gemini-2.0-flash-exp, trying next model...
🔄 [GEMINI TEXT] Trying model: gemini-2.5-pro
```

### When Service is Unavailable
```
❌ [GEMINI TEXT] Model gemini-2.5-pro failed: { message: 'Service unavailable', status: 503 }
⚠️ [GEMINI TEXT] Model gemini-2.5-pro is overloaded/unavailable, trying next model...
🔄 [GEMINI TEXT] Trying model: gemini-1.5-flash-002
```

### When All Models Fail
```
❌ [GEMINI TEXT] All models failed. Last error: Error: Quota exceeded
❌ [CHATBOT] Error sending message: Error: Failed to get response from Gemini: All models failed
```

## Available Models for Users

Users can manually select from:
- LongCat-Flash-Chat
- LongCat-Flash-Thinking
- Gemini 2.0 Flash (Experimental)
- **Gemini 2.5 Pro** (NEW)
- Gemini 1.5 Flash
- Gemini 1.5 Pro

## Benefits

1. **No Server Crashes**: All errors are caught and handled gracefully
2. **Automatic Recovery**: Tries alternative models automatically
3. **Detailed Logging**: Complete error information logged to console
4. **User Awareness**: Users know when issues occur via error messages
5. **Manual Override**: Users can select specific models
