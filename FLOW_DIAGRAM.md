# GitHub Models Discovery Flow - Before vs After

## BEFORE (Broken)

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend: User opens AI Assistant                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend: GET /api/github-models/models                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend: controller.getModelsList()                         │
│   - Gets githubModelsPAT from env                           │
│   - Calls registry.getModels(pat)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend: discovery.discoverModels(pat)                      │
│   ❌ WRONG ENDPOINT                                         │
│   - Calls: https://models.inference.ai.azure.com/models     │
│   - Headers: Content-Type: application/json                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Azure AI Endpoint Response                                  │
│   - Status: 200 OK (but wrong structure)                    │
│   - Body: {} or unexpected format                           │
│   - data.data is undefined or []                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Result: 0 models discovered                                 │
│   Console: ✅ Discovery successful, found 0 models          │
│           ⚠️  Using fallback catalog                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Fallback: Return hardcoded model list                       │
│   - All models marked as available: false                   │
│   - User sees "unavailable" in dropdown                     │
└─────────────────────────────────────────────────────────────┘
```

## AFTER (Fixed)

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend: User opens AI Assistant                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend: GET /api/github-models/models                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend: controller.getModelsList()                         │
│   - Gets githubModelsPAT from env                           │
│   - Calls registry.getModels(pat)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend: discovery.discoverModels(pat)                      │
│   ✅ CORRECT ENDPOINT                                       │
│   - Calls: https://api.github.com/models                    │
│   - Headers: Accept: application/vnd.github+json            │
│             X-GitHub-Api-Version: 2022-11-28                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ GitHub API Response                                         │
│   - Status: 200 OK                                          │
│   - Body: [                                                 │
│       { name: "gpt-4o", ... },                              │
│       { name: "claude-3-opus", ... },                       │
│       ...                                                   │
│     ]                                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Parse Response                                              │
│   - Handle array or object structure ✅                     │
│   - Extract model.name or model.id ✅                       │
│   - Map to internal format ✅                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Result: X models discovered                                 │
│   Console: ✅ Discovery successful, found X models          │
│           ✅ Returning X discovered models                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Success: Return discovered model list                       │
│   - All models marked as available: true                    │
│   - User can select and use models                          │
│   - Chat uses: https://models.inference.ai.azure.com/       │
│                chat/completions                             │
└─────────────────────────────────────────────────────────────┘
```

## Key Differences

| Aspect | Before (❌) | After (✅) |
|--------|------------|-----------|
| **Discovery Endpoint** | `https://models.inference.ai.azure.com/models` | `https://api.github.com/models` |
| **Headers** | `Content-Type: application/json` | `Accept: application/vnd.github+json`<br>`X-GitHub-Api-Version: 2022-11-28` |
| **Response Handling** | Only `data.data` | Array or `data.data` |
| **Model ID Field** | Only `model.id` | `model.name` or `model.id` |
| **Models Found** | 0 | Actual available models |
| **Model Status** | `available: false` | `available: true` |
| **Debugging** | None | `DEBUG_GITHUB_MODELS` env var |

## Important Notes

1. **Discovery vs Inference**: 
   - Discovery uses GitHub API: `https://api.github.com/models`
   - Inference uses Azure AI: `https://models.inference.ai.azure.com/chat/completions`

2. **Fallback Still Works**:
   - If discovery fails (no PAT, network error, etc.)
   - System gracefully falls back to hardcoded model list
   - Models marked as `available: false`

3. **User Requirements**:
   - GitHub Personal Access Token (PAT)
   - GitHub Copilot or GitHub Models access
   - Token in `backend/.env` as `githubModelsPAT`
