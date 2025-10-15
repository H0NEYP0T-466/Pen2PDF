# GitHub Models API Error Fix

## Problem
The application was returning "Unknown model: gpt-4" error when trying to use GitHub Models API. This happened because:

1. **Invalid model names in fallback list**: The registry included model names like `gpt-4`, `gpt-5`, `gpt-4-turbo`, and `gpt-3.5-turbo` which are **not available** in the GitHub Models API
2. **Disabled discovery**: Model discovery from GitHub API was disabled, causing the app to always use the fallback list with invalid models
3. **User confusion**: Users could select models from the dropdown that don't actually exist in the GitHub Models marketplace

## Error Log Example
```
⚠️ [GITHUB MODELS] API error for model: gpt-4
   Status: 400 Bad Request
   Error details: {"error":{"code":"unknown_model","message":"Unknown model: gpt-4","details":"Unknown model: gpt-4"}}
```

## Solution Implemented

### 1. Re-enabled Model Discovery (discovery.js)
- Implemented proper discovery from `https://api.github.com/models`
- Uses correct GitHub API headers:
  - `Accept: application/vnd.github+json`
  - `X-GitHub-Api-Version: 2022-11-28`
- Handles both array and object response formats
- Gracefully falls back to catalog if discovery fails
- Added `DEBUG_GITHUB_MODELS` env variable for debugging

### 2. Cleaned Up Fallback Models (registry.js)
Removed invalid models:
- ❌ `gpt-5` (not available in GitHub Models)
- ❌ `gpt-4` (not available in GitHub Models)
- ❌ `gpt-4-turbo` (not available in GitHub Models)
- ❌ `gpt-3.5-turbo` (not available in GitHub Models)
- ❌ `claude-3-5-sonnet-4.5` (incorrect version number)

Added valid models:
- ✅ `gpt-4o` (latest GPT-4 with vision)
- ✅ `gpt-4o-mini` (efficient GPT-4 with vision)
- ✅ `o1-preview` (OpenAI o1 preview)
- ✅ `o1-mini` (OpenAI o1 mini)

Kept 35 verified models across 8 providers:
- OpenAI
- Anthropic
- Google
- Meta
- Mistral
- Cohere
- AI21 Labs
- Microsoft

### 3. Updated Registry Logic
- **With PAT**: First tries to discover models from GitHub API
- **Discovery fails**: Falls back to curated catalog of 35 models
- **No PAT**: Uses fallback catalog, marks all as unavailable

### 4. Fixed Linting Issues
- Removed unused `parseError` variable in controller.js

## Files Changed

1. **`backend/github-models/discovery.js`**
   - Implemented actual model discovery from GitHub API
   - Added proper error handling and fallback logic
   - Added debug mode support

2. **`backend/github-models/registry.js`**
   - Removed 5 invalid model names from fallback list
   - Added o1-preview and o1-mini models
   - Integrated discovery into getModels() function
   - Updated provider detection for o1 models

3. **`backend/github-models/controller.js`**
   - Fixed linting error (removed unused parseError variable)

## Testing

### Test Results
✅ All registry tests passing:
- Fallback models: 35 (down from 38)
- No invalid models found
- Valid models present: gpt-4o, gpt-4o-mini, o1-preview, o1-mini
- Provider detection: 8 providers
- Model structure validation: passed

### How to Test

1. **Without PAT** (fallback mode):
   ```bash
   node /tmp/test-registry.js
   ```
   Expected: 35 models, all marked as unavailable

2. **With PAT** (discovery mode):
   ```bash
   node /tmp/test-discovery.js YOUR_GITHUB_PAT
   ```
   Expected: List of actual available models from GitHub

3. **Enable debug mode**:
   ```env
   DEBUG_GITHUB_MODELS=true
   ```
   Shows detailed discovery logs

## Usage Recommendations

### For Users
1. **Don't use `gpt-4`** - Use `gpt-4o` or `gpt-4o-mini` instead
   - Note: `gpt-4o` is GitHub Models' designation for the latest GPT-4 variant with vision capabilities
   - The "o" stands for "omni" (multimodal capabilities)
2. **Check model availability** - The dropdown now only shows models that actually exist
3. **Switch models on error** - If one model hits quota, try another

### For Developers
1. **Enable debug mode** during development to see discovery logs
2. **Verify PAT** is correctly configured in `.env`
3. **Monitor discovery** - If it fails, check PAT permissions

## Benefits

1. ✅ **No more "unknown model" errors** - Only valid models are listed
2. ✅ **Automatic model discovery** - Gets latest models from GitHub API
3. ✅ **Better fallback** - Curated list of 35 verified models
4. ✅ **Clearer error messages** - Users know which models are actually available
5. ✅ **Future-proof** - Discovery will automatically include new models

## Model Count Changes

- **Before**: 38 models (including 5 invalid ones)
- **After**: 35 verified models (discovery may return more)

## Related Files

- `GITHUB_MODELS_IMPLEMENTATION.md` - Should be updated to:
  - Change model count from 36/38 to 35 verified models
  - Remove references to gpt-4, gpt-5, gpt-4-turbo, gpt-3.5-turbo
  - Add o1-preview and o1-mini to OpenAI models list
  - Update the note about discovery being enabled (not deprecated)
- `FLOW_DIAGRAM.md` - Already documents the correct discovery flow
- `.env.example` - Already includes githubModelsPAT setup

## Next Steps

If you continue to see "unknown model" errors:
1. Verify your GitHub PAT has correct permissions
2. Check if the model is listed in `GET /api/github-models/models` response
3. Enable `DEBUG_GITHUB_MODELS=true` to see discovery details
4. Try using `gpt-4o` instead of `gpt-4`
