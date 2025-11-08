/**
 * GitHub Models Controller
 */

const { getModels } = require('./registry');
const { isFileAllowed } = require('./filePolicy');
const Chat = require('../model/chatData');
require('dotenv').config();

const GITHUB_MODELS_BASE = 'https://models.inference.ai.azure.com';


async function getModelsList(req, res) {
  try {
    const pat = process.env.githubModelsPAT;
    
    if (!pat) {
      console.warn('⚠️ [GITHUB MODELS] No PAT configured, returning fallback models');
    }
    
    const models = await getModels(pat);
    
    res.json({
      success: true,
      models
    });
  } catch (error) {
    console.error('❌ [GITHUB MODELS] Error fetching models:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch models',
      message: error.message
    });
  }
}

/**
 * Log structured chat event
 */
function logChatEvent(level, event, data) {
  const logEntry = {
    ts: new Date().toISOString(),
    level,
    event,
    ...data
  };
  
  console.log(JSON.stringify(logEntry));
}

/**
 * POST /api/github-models/chat
 * Chat with a GitHub Model
 */
async function chat(req, res) {
  try {
    let { model, messages, temperature, max_tokens, contextNotes } = req.body;
    

    if (max_tokens === undefined) {
      max_tokens = 4096;
      console.log('⚙️ [GITHUB MODELS] No max_tokens provided, using default:', max_tokens);
    }
    
    if (!model || !messages) {
      const error = {
        type: 'validation_error',
        message: 'Missing required fields: model and messages',
        status: 400
      };
      
      logChatEvent('error', 'validation_error', {
        model,
        error: error.message
      });
      
      return res.status(400).json({ error });
    }

    // Parse messages if it's a JSON string (sent from FormData)
    if (typeof messages === 'string') {
      try {
        messages = JSON.parse(messages);
      } catch {
        const error = {
          type: 'validation_error',
          message: 'Invalid messages format: must be a valid JSON array',
          status: 400
        };
        
        logChatEvent('error', 'validation_error', {
          model,
          error: error.message
        });
        
        return res.status(400).json({ error });
      }
    }

    // Parse contextNotes if it's a JSON string
    if (typeof contextNotes === 'string') {
      try {
        contextNotes = JSON.parse(contextNotes);
      } catch {
        contextNotes = [];
      }
    }

    // Validate messages is an array
    if (!Array.isArray(messages)) {
      const error = {
        type: 'validation_error',
        message: 'Messages must be an array',
        status: 400
      };
      
      logChatEvent('error', 'validation_error', {
        model,
        error: error.message
      });
      
      return res.status(400).json({ error });
    }

    // Handle file upload if present - validate BEFORE checking PAT
    let processedMessages = [...messages];
    if (req.files && req.files.file) {
      const file = req.files.file;
      
      // Validate file against model policy
      if (!isFileAllowed(model, file.mimetype)) {
        const error = {
          type: 'validation_error',
          message: `File type ${file.mimetype} is not allowed for model ${model}`,
          status: 400
        };
        
        logChatEvent('error', 'validation_error', {
          model,
          file_type: file.mimetype,
          error: error.message
        });
        
        return res.status(400).json({ error });
      }

      // Convert image to base64 for the API
      const base64 = Buffer.from(file.data).toString('base64');
      const imageUrl = `data:${file.mimetype};base64,${base64}`;
      
      // Add image to the last user message
      const lastUserMsgIndex = processedMessages.map(m => m.role).lastIndexOf('user');
      
      if (lastUserMsgIndex >= 0) {
        processedMessages[lastUserMsgIndex] = {
          role: 'user',
          content: [
            {
              type: 'text',
              text: processedMessages[lastUserMsgIndex].content
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              }
            }
          ]
        };
      }
    }

    // NOW check PAT (after file validation)
    const pat = process.env.githubModelsPAT;
    
    if (!pat) {
      const error = {
        type: 'configuration_error',
        message: 'GitHub Models PAT not configured. Please set githubModelsPAT in environment.',
        status: 500
      };
      
      logChatEvent('error', 'configuration_error', {
        error: error.message
      });
      
      return res.status(500).json({ error });
    }

    // Extract user message for logging
    const userMessage = messages.find(m => m.role === 'user')?.content || '';
    const userMessagePreview = typeof userMessage === 'string' 
      ? userMessage.substring(0, 100) 
      : '[multipart message]';

    logChatEvent('info', 'chat_request', {
      model,
      user_message: userMessagePreview
    });

    // Add system instruction (same as LongCat/Gemini)
    const systemInstruction = `You are Isabella, a helpful AI assistant integrated into the Pen2PDF productivity suite. You help users with their questions, provide insights from their notes, and assist with various tasks. Be concise, helpful, and friendly.`;

    // Process context notes (same as LongCat/Gemini)
    // Add context notes to the user's message if present
    if (contextNotes && contextNotes.length > 0) {
      console.log('📄 [GITHUB MODELS] Context notes included:', contextNotes.length, 'notes');
      
      let contextText = '\n\nContext from notes:\n';
      contextNotes.forEach(note => {
        contextText += `\n--- ${note.title} ---\n${note.content}\n`;
        console.log(`   📌 Note: ${note.title} (${note.content.length} chars)`);
      });

      // Find the last user message and prepend context
      const lastUserMsgIndex = processedMessages.map(m => m.role).lastIndexOf('user');
      if (lastUserMsgIndex >= 0) {
        const originalContent = processedMessages[lastUserMsgIndex].content;
        
        // Handle both string and multipart content
        if (typeof originalContent === 'string') {
          processedMessages[lastUserMsgIndex] = {
            ...processedMessages[lastUserMsgIndex],
            content: contextText + '\n\n' + originalContent
          };
        } else if (Array.isArray(originalContent)) {
          // If content is already multipart (has images), prepend context to text part
          const textPart = originalContent.find(part => part.type === 'text');
          if (textPart) {
            textPart.text = contextText + '\n\n' + textPart.text;
          } else {
            // Add text part if none exists
            originalContent.unshift({
              type: 'text',
              text: contextText
            });
          }
        }
      }
    }

    // Add system message at the beginning - create new array instead of reassigning
    const finalMessages = [
      { role: 'system', content: systemInstruction },
      ...processedMessages
    ];

    // Call GitHub Models API
    const requestBody = {
      model,
      messages: finalMessages,
      ...(temperature !== undefined && { temperature }),
      ...(max_tokens !== undefined && { max_tokens })
    };

    console.log('\n' + '='.repeat(80));
    console.log('🚀 [GITHUB MODELS] Sending request to GitHub Models API');
    console.log(`   Model: ${model}`);
    console.log('─'.repeat(80));
    console.log('📋 [GITHUB MODELS] System Instruction:');
    console.log(systemInstruction);
    console.log('─'.repeat(80));
    console.log('📨 [GITHUB MODELS] User Message:');
    console.log(userMessage);
    console.log('─'.repeat(80));
    if (contextNotes && contextNotes.length > 0) {
      console.log('📄 [GITHUB MODELS] Context Notes:');
      contextNotes.forEach((note, idx) => {
        console.log(`   Note ${idx + 1}: ${note.title}`);
        console.log(`   ${note.content.substring(0, 200)}${note.content.length > 200 ? '...' : ''}`);
      });
      console.log('─'.repeat(80));
    }
    console.log('🔵 [GITHUB MODELS] Full Request Body:');
    console.log(JSON.stringify(requestBody, null, 2));
    console.log('─'.repeat(80));
    
    const response = await fetch(`${GITHUB_MODELS_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pat}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    // Capture provider headers
    const providerHeaders = {};
    ['x-ratelimit-remaining', 'x-ratelimit-reset', 'x-request-id', 'x-ms-request-id'].forEach(header => {
      const value = response.headers.get(header);
      if (value) {
        providerHeaders[header] = value;
      }
    });

    // Handle rate limit errors - don't crash, log and inform user
    if (response.status === 429) {
      const errorText = await response.text();
      
      console.log(`⚠️ [GITHUB MODELS] Rate limit/quota reached for model: ${model}`);
      console.log(`   User should switch to a different model`);
      console.log(`   Error details: ${errorText.substring(0, 200)}`);
      
      const error = {
        type: 'rate_limit',
        message: `Model "${model}" has reached its quota or rate limit. Please switch to a different model.`,
        status: 429
      };
      
      logChatEvent('warn', 'rate_limit', {
        model,
        user_message: userMessagePreview,
        status: 429,
        provider_headers: providerHeaders,
        error_detail: errorText.substring(0, 200)
      });
      
      return res.status(429).json({ error });
    }

    // Handle other errors - don't crash, log and inform user
    if (!response.ok) {
      const errorText = await response.text();
      
      console.log(`⚠️ [GITHUB MODELS] API error for model: ${model}`);
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Error details: ${errorText.substring(0, 200)}`);
      
      const error = {
        type: 'api_error',
        message: `GitHub Models API error: ${response.status} ${response.statusText}`,
        status: response.status
      };
      
      logChatEvent('error', 'api_error', {
        model,
        user_message: userMessagePreview,
        status: response.status,
        provider_headers: providerHeaders,
        error_detail: errorText.substring(0, 200)
      });
      
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    
    // Log the full API response
    console.log('📦 [GITHUB MODELS] Full API Response:');
    console.log('─'.repeat(80));
    console.log(JSON.stringify(data, null, 2));
    console.log('─'.repeat(80));
    
    // Extract response content
    const assistantMessage = data.choices?.[0]?.message?.content || 'No response';
    
    console.log('📨 [GITHUB MODELS] Complete Response from Model:');
    console.log('─'.repeat(80));
    console.log(assistantMessage);
    console.log('─'.repeat(80));
    console.log('='.repeat(80) + '\n');
    
    // Extract usage info (handle both OpenAI and Anthropic formats)
    const usage = data.usage || {};
    const usageInfo = {
      prompt_tokens: usage.prompt_tokens || usage.input_tokens,
      completion_tokens: usage.completion_tokens || usage.output_tokens,
      total_tokens: usage.total_tokens
    };

    logChatEvent('info', 'chat_response', {
      model,
      user_message: userMessagePreview,
      response_preview: assistantMessage.substring(0, 200),
      usage: usageInfo,
      status: 200,
      provider_headers: providerHeaders
    });

    // Save to database (same as legacy models)
    try {
      let chat = await Chat.findOne();
      if (!chat) {
        console.log('📝 [GITHUB MODELS] Creating new chat session');
        chat = new Chat({ messages: [], currentModel: model });
      }

      chat.currentModel = model;
      
      // Add user message (use the original userMessage extracted at line 195)
      const userMsg = {
        id: Date.now().toString(),
        role: 'user',
        content: typeof userMessage === 'string' ? userMessage : '[multipart message]',
        timestamp: new Date(),
        attachments: req.files && req.files.file ? [{
          fileName: req.files.file.name,
          fileType: req.files.file.mimetype,
          fileData: Buffer.from(req.files.file.data).toString('base64')
        }] : [],
        contextNotes: contextNotes || []
      };
      chat.messages.push(userMsg);

      // Add assistant message
      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantMessage,
        model: model,
        timestamp: new Date()
      };
      chat.messages.push(assistantMsg);

      chat.updatedAt = new Date();
      await chat.save();

      console.log('💾 [GITHUB MODELS] Messages saved to database');
    } catch (dbError) {
      console.error('❌ [GITHUB MODELS] Error saving to database:', dbError);
      // Continue anyway - don't fail the request due to DB issues
    }

    res.json({
      success: true,
      message: assistantMessage,
      usage: usageInfo,
      model: data.model || model
    });

  } catch (error) {
    console.error('❌ [GITHUB MODELS] Chat error:', error);
    console.log('   Server will continue running - user can switch models');
    
    logChatEvent('error', 'chat_error', {
      error: error.message,
      stack: error.stack?.substring(0, 200)
    });
    
    res.status(500).json({
      error: {
        type: 'internal_error',
        message: 'An error occurred processing your request. Please try a different model.',
        status: 500
      }
    });
  }
}

module.exports = {
  getModelsList,
  chat
};
