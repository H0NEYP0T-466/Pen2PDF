# Environment Setup Guide

This guide explains how to set up the environment variables required for the Pen2PDF application.

## Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```bash
cd backend
touch .env
```

Add the following content to the `.env` file:

```env
# Google Gemini AI API Key (Required for AI features)
# Get your API key from: https://ai.google.dev/
GEMINI_API_KEY=your_gemini_api_key_here

# LongCat API Key (Required for AI Assistant LongCat models)
# Get your API key from LongCat
LONGCAT_API_KEY=your_longcat_api_key_here
```

## Supported Variable Names

The application supports both naming conventions for compatibility:

### Gemini API
- `GEMINI_API_KEY` (recommended)
- `geminiApiKey` (alternative)

### LongCat API
- `LONGCAT_API_KEY` (recommended)
- `longcatApiKey` (alternative)

## Getting API Keys

### Google Gemini API Key
1. Visit [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key to your `.env` file

### LongCat API Key
1. Contact LongCat or visit their platform
2. Get your API key from the documentation provided
3. Copy the API key to your `.env` file

## Important Notes

- **Never commit your `.env` file to version control** - it's already in `.gitignore`
- Keep your API keys secure and don't share them publicly
- If you accidentally expose an API key, regenerate it immediately

## Verifying Setup

After setting up your `.env` file:

1. Restart your backend server:
   ```bash
   cd backend
   node index.js
   ```

2. Test the AI Assistant:
   - Open the AI Assistant from the main page
   - Try sending a message with Gemini models
   - Try sending a message with LongCat models

If you see error messages about API keys, verify:
- The `.env` file exists in the `backend` directory
- The API keys are correctly copied (no extra spaces or quotes)
- The environment variable names match exactly

## Troubleshooting

### "LongCat API key not configured" error
- Ensure `LONGCAT_API_KEY` is set in your `.env` file
- Restart the backend server after adding the key

### "Network error: Unable to connect to Gemini API" error
- Check your internet connection
- Verify your Gemini API key is valid
- Check if there are any firewall/proxy restrictions

### "Failed to get response from LongCat" error
- Verify your LongCat API key is valid
- Check the LongCat service status
- Ensure you have proper internet connectivity
