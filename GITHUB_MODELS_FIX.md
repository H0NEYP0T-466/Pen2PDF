# GitHub Models Discovery Fix - Verification Guide

## What Was Fixed

The GitHub Models discovery feature was not working because it was using the wrong API endpoint. This fix changes the discovery mechanism to use the correct GitHub API.

## Changes Made

### 1. API Endpoint Change
- **Before**: `https://models.inference.ai.azure.com/models` (Azure AI endpoint - doesn't support model listing)
- **After**: `https://api.github.com/models` (GitHub API endpoint - supports model discovery)

### 2. API Headers Update
- Added proper GitHub API headers:
  - `Accept: application/vnd.github+json`
  - `X-GitHub-Api-Version: 2022-11-28`

### 3. Response Structure Handling
- Enhanced to handle different response structures (array or object)
- Support both `name` and `id` fields for model identification

### 4. Debug Mode
- Added `DEBUG_GITHUB_MODELS` environment variable to log raw API responses for troubleshooting

## How to Verify the Fix

### Prerequisites
1. You need a GitHub Personal Access Token (PAT) with `read:packages` scope
2. You need access to GitHub Models (included with GitHub Copilot or Student Developer Pack)

### Step 1: Create GitHub PAT
1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name (e.g., "Pen2PDF GitHub Models")
4. Select the `read:packages` scope
5. Click "Generate token"
6. Copy the token (you won't be able to see it again!)

### Step 2: Configure Environment
1. Create or edit `backend/.env` file:
```env
githubModelsPAT=your_github_pat_here
```

### Step 3: Start the Backend Server
```bash
cd backend
node index.js
```

### Step 4: Test the Discovery Endpoint

Option A - Using curl:
```bash
curl http://localhost:8000/api/github-models/models
```

Option B - Using the frontend:
1. Start the frontend: `npm run dev`
2. Open http://localhost:5173
3. Open the AI Assistant
4. Check the model dropdown - you should see GitHub Models

### Expected Results

#### Success Case
When the discovery works, you should see logs like:
```
🔍 [GITHUB MODELS] Discovering models from GitHub Models API...
✅ [GITHUB MODELS] Discovery successful, found X models
✅ [GITHUB MODELS] Returning X discovered models
```

And the API response should contain an array of models with `available: true`.

#### Fallback Case (No PAT or Invalid PAT)
If no PAT is configured or it's invalid, you'll see:
```
⚠️ [GITHUB MODELS] No PAT configured, returning fallback models
⚠️ [GITHUB MODELS] Using fallback catalog
```

The system will still work but models will be marked as `available: false`.

## Debugging

If models are still not discovered after applying the fix:

### 1. Check Your PAT
- Ensure it has the `read:packages` scope
- Verify it hasn't expired
- Make sure you have access to GitHub Models

### 2. Enable Debug Mode
Add to your `.env`:
```env
DEBUG_GITHUB_MODELS=true
```

This will log the raw API response to help identify issues.

### 3. Check the API Response Manually
```bash
curl -H "Authorization: Bearer YOUR_PAT" \
     -H "Accept: application/vnd.github+json" \
     -H "X-GitHub-Api-Version: 2022-11-28" \
     https://api.github.com/models
```

### 4. Common Issues

**Issue**: 403 Forbidden
- **Cause**: PAT doesn't have correct scope or you don't have access to GitHub Models
- **Fix**: Check your PAT scopes and GitHub Models access

**Issue**: 404 Not Found
- **Cause**: GitHub Models API endpoint might have changed
- **Fix**: Check GitHub's documentation for the current API endpoint

**Issue**: Still seeing 0 models
- **Cause**: Your account might not have any models enabled
- **Fix**: Check your GitHub Copilot or Student Developer Pack status

## Additional Notes

- The fallback catalog is maintained as a safety net
- Models discovered via API are marked as `available: true`
- Fallback models are marked as `available: false`
- The chat endpoint still uses Azure AI for inference: `https://models.inference.ai.azure.com/chat/completions`
