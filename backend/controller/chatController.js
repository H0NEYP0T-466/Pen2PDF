const Chat = require('../model/chatData');
const { GoogleGenAI } = require("@google/genai");
const { callLongCatAPI } = require('../longcat/longcat');
require("dotenv").config();

const ai = new GoogleGenAI({
  apiKey: process.env.geminiApiKey || process.env.GEMINI_API_KEY,
});

const GEMINI_PRIMARY_MODEL = "gemini-2.5-pro";
const GEMINI_FALLBACK_MODEL = "gemini-2.5-flash";

const getChatHistory = async (req, res) => {
  try {
    console.log('📥 [CHAT] Get chat history request received');
    
    let chat = await Chat.findOne();
    
    if (!chat) {
      console.log('📝 [CHAT] No chat history found, creating new chat document');
      chat = new Chat({ messages: [], currentModel: 'gemini-2.5-pro' });
      await chat.save();
    } else {
      console.log(`📚 [CHAT] Retrieved chat history with ${chat.messages.length} messages`);
    }

    const last50Messages = chat.messages.slice(-25);
    
    res.json({
      success: true,
      data: {
        messages: last50Messages,
        currentModel: chat.currentModel
      }
    });
    console.log(`✅ [CHAT] Chat history sent successfully (${last50Messages.length} messages)`);
  } catch (error) {
    console.error('❌ [CHAT] Error fetching chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history',
      error: error.message
    });
  }
};

const sendMessage = async (req, res) => {
  let userMessage = null;
  let model = null;
  
  try {
    const { message, model: requestModel, attachments, contextNotes, sendWithoutHistory } = req.body;
    model = requestModel;

    console.log('\n' + '='.repeat(80));
    console.log('🤖 [CHATBOT] User accessed chatbot');
    console.log('📊 [CHATBOT] Model requested:', model);
    console.log('💬 [CHATBOT] User query:', message);
    console.log('🔄 [CHATBOT] Send without history:', sendWithoutHistory ? 'YES' : 'NO');
    
    let chat = await Chat.findOne();
    if (!chat) {
      console.log('📝 [CHATBOT] Creating new chat session');
      chat = new Chat({ messages: [], currentModel: model || 'gemini-2.5-pro' });
    }

    chat.currentModel = model || chat.currentModel;

    userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      attachments: attachments || [],
      contextNotes: contextNotes || []
    };
    chat.messages.push(userMessage);

    // Only include context window if sendWithoutHistory is false
    const contextWindow = sendWithoutHistory ? [] : chat.messages.slice(-11, -1).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    console.log('📚 [CHATBOT] Context window size:', contextWindow.length, 'messages');
    
    if (contextNotes && contextNotes.length > 0) {
      console.log('📄 [CHATBOT] Context notes included:', contextNotes.length, 'notes');
      contextNotes.forEach((note, idx) => {
        console.log(`   📌 Note ${idx + 1}: ${note.title} (${note.content.length} chars)`);
      });
    }

    let aiResponse;
    
    if (model.startsWith('longcat')) {
      console.log('🔄 [CHATBOT] Using LongCat API');
      aiResponse = await callLongCatAPI(model, message, contextNotes, contextWindow);
    } else {
      console.log('🔄 [CHATBOT] Using Gemini API');
      aiResponse = await callGeminiAPI(model, message, attachments, contextNotes, contextWindow);
    }

    console.log('📤 [CHATBOT] Model response received (length:', aiResponse.length, 'chars)');
    console.log('📝 [CHATBOT] Response preview:', aiResponse.substring(0, 200) + (aiResponse.length > 200 ? '...' : ''));
    
    const assistantMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse,
      model: model,
      timestamp: new Date()
    };
    chat.messages.push(assistantMessage);

    chat.updatedAt = new Date();
    await chat.save();

    console.log('✅ [CHATBOT] Response sent successfully using model:', model);
    console.log('='.repeat(80) + '\n');

    res.json({
      success: true,
      data: {
        userMessage,
        assistantMessage
      }
    });
  } catch (error) {
    console.error('❌ [CHATBOT] Error sending message:', error);
    console.log('='.repeat(80) + '\n');
    
    // Send error message back to user instead of crashing
    res.status(200).json({
      success: true,
      data: {
        userMessage,
        assistantMessage: {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `❌ Error: ${error.message}\n\nPlease try again with a different model or wait a moment.`,
          model: model,
          timestamp: new Date()
        }
      }
    });
  }
};

async function callGeminiAPI(model, message, attachments, contextNotes, chatHistory = []) {
  try {
    let contextText = '';
    if (contextNotes && contextNotes.length > 0) {
      contextText = '\n\nContext from notes:\n';
      contextNotes.forEach(note => {
        contextText += `\n--- ${note.title} ---\n${note.content}\n`;
      });
    }

    let historyText = '';
    if (chatHistory && chatHistory.length > 0) {
      const historyMessages = chatHistory.map(msg => 
        `${msg.role === 'user' ? 'User' : 'Bella'}: ${msg.content}`
      ).join('\n');
      
      historyText = `\n\nHere is your previous chat with the user:\n\n${historyMessages}\n\nNow respond to their current message below.\n\n`;
    }

    const fullMessage = contextText + historyText + 'User question: ' + message;

    console.log('📋 [GEMINI] Full prompt being sent to model:');
    console.log('─'.repeat(80));
    console.log(fullMessage);
    console.log('─'.repeat(80));

    const parts = [{ text: fullMessage }];

    if (attachments && attachments.length > 0) {
      console.log('📎 [GEMINI] Adding', attachments.length, 'attachments to request');
      attachments.forEach(attachment => {
        parts.push({
          inlineData: {
            mimeType: attachment.fileType,
            data: attachment.fileData
          }
        });
      });
    }

    const systemInstruction = `You are Isabella, a helpful AI assistant integrated into the Pen2PDF productivity suite. You help users with their questions, provide insights from their notes, and assist with various tasks. Be concise, helpful, and friendly.`;

  
    let primaryModel = model;
    let fallbackModel = null;
    
    if (model === 'gemini-2.5-pro') {
      fallbackModel = 'gemini-2.5-flash';
    } else if (model === 'gemini-2.5-flash') {
      fallbackModel = 'gemini-2.5-pro';
    }

    console.log('🚀 [GEMINI] Primary model:', primaryModel);
    if (fallbackModel) {
      console.log('🔄 [GEMINI] Fallback model:', fallbackModel);
    }

    const models = fallbackModel ? [primaryModel, fallbackModel] : [primaryModel];
    let lastError = null;

    for (let i = 0; i < models.length; i++) {
      const currentModel = models[i];
      const isPrimary = i === 0;

      try {
        console.log(`\n🔄 [GEMINI] Attempting ${currentModel}...`);
        console.log('📤 [GEMINI] Making API call to Gemini...');
        
        const response = await ai.models.generateContent({
          model: currentModel,
          contents: parts,
          config: { systemInstruction }
        });

        console.log('📦 [GEMINI] Full API response received:');
        console.log('─'.repeat(80));
        console.log(JSON.stringify(response, null, 2));
        console.log('─'.repeat(80));

        const responseText = response.text || 'I apologize, but I could not generate a response.';

        console.log(`✅ [GEMINI] ${currentModel} responded successfully.`);
        console.log('📨 [GEMINI] Complete response from model:');
        console.log('─'.repeat(80));
        console.log(responseText);
        console.log('─'.repeat(80));

        return responseText;
      } catch (error) {
        lastError = error;
        console.error(`❌ [GEMINI] Model ${currentModel} failed:`, {
          message: error?.message,
          status: error?.status || error?.code,
          stack: error?.stack
        });
        
        const code = error?.status || error?.code;
        const msg = (error?.message || "").toLowerCase();
        
        const isQuotaError = code === 429 || msg.includes("quota") || msg.includes("rate limit") || msg.includes("resource has been exhausted");
        const isNotFound = code === 404 || msg.includes("not found");
        const isForbidden = code === 403;
        const isServiceUnavailable = code === 503 || msg.includes("overloaded") || msg.includes("unavailable");
        
        const isRetryable = isQuotaError || isNotFound || isForbidden || isServiceUnavailable;
        
        if (isRetryable && !isPrimary) {
          // Already on fallback, no more models to try
          console.error(`❌ [GEMINI] Fallback model also failed. No more models to try.`);
          break;
        } else if (isRetryable && isPrimary && fallbackModel) {
          // Try fallback
          if (isQuotaError) {
            console.log(`⏳ [GEMINI] Model ${currentModel} quota reached or unavailable, retrying ${fallbackModel}...`);
          } else if (isForbidden) {
            console.log(`🚫 [GEMINI] Model ${currentModel} access forbidden (403), retrying ${fallbackModel}...`);
          } else if (isNotFound) {
            console.log(`🔍 [GEMINI] Model ${currentModel} not found (404), retrying ${fallbackModel}...`);
          } else if (isServiceUnavailable) {
            console.log(`⚠️ [GEMINI] Model ${currentModel} service unavailable (503), retrying ${fallbackModel}...`);
          }
          continue;
        } else {
          // Non-retryable error or no fallback
          break;
        }
      }
    }

    // If we get here, all attempts failed
    const code = lastError?.status || lastError?.code;
    const msg = (lastError?.message || "").toLowerCase();
    
    const isRateLimit = code === 429 || msg.includes("quota") || msg.includes("rate limit") || msg.includes("resource has been exhausted");
    const isServiceUnavailable = code === 503 || msg.includes("overloaded") || msg.includes("unavailable");
    
    if (isRateLimit) {
      console.log('⏳ [GEMINI] All models rate limit/quota exceeded');
      throw new Error(`⚠️ Model "${model}" and its fallback have reached their quota or rate limit. Please try a different model or wait a few moments before trying again.`);
    } else if (isServiceUnavailable) {
      console.log('⚠️ [GEMINI] All models service unavailable');
      throw new Error(`⚠️ Model "${model}" and its fallback are currently unavailable or overloaded. Please try a different model.`);
    }
    
    if (lastError.message && lastError.message.includes('fetch failed')) {
      throw new Error('Network error: Unable to connect to Gemini API. Please check your internet connection.');
    }
    
    throw new Error('Failed to get response from Gemini: ' + lastError.message);
  } catch (error) {
    // Re-throw if already formatted
    if (error.message.startsWith('⚠️') || error.message.startsWith('Network error')) {
      throw error;
    }
    
    console.error('❌ [GEMINI] Unexpected error:', error);
    throw new Error('Failed to get response from Gemini: ' + error.message);
  }
}

const clearChatHistory = async (req, res) => {
  try {
    console.log('🗑️  [CHAT] Clear chat history request received');
    
    let chat = await Chat.findOne();
    
    if (chat) {
      const messageCount = chat.messages.length;
      chat.messages = [];
      chat.updatedAt = new Date();
      await chat.save();
      console.log(`✅ [CHAT] Chat history cleared (${messageCount} messages removed)`);
    } else {
      console.log('📝 [CHAT] No chat history to clear');
    }

    res.json({
      success: true,
      message: 'Chat history cleared successfully'
    });
  } catch (error) {
    console.error('❌ [CHAT] Error clearing chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear chat history',
      error: error.message
    });
  }
};

module.exports = {
  getChatHistory,
  sendMessage,
  clearChatHistory
};
