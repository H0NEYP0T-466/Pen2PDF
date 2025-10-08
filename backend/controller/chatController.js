const Chat = require('../model/chatData');
const { GoogleGenAI } = require("@google/genai");
const { callLongCatAPI } = require('../longcat/longcat');
require("dotenv").config();

const ai = new GoogleGenAI({
  apiKey: process.env.geminiApiKey || process.env.GEMINI_API_KEY,
});

const getChatHistory = async (req, res) => {
  try {
    console.log('📥 [CHAT] Get chat history request received');
    
    let chat = await Chat.findOne();
    
    if (!chat) {
      console.log('📝 [CHAT] No chat history found, creating new chat document');
      chat = new Chat({ messages: [], currentModel: 'gemini-2.5-flash' });
      await chat.save();
    } else {
      console.log(`📚 [CHAT] Retrieved chat history with ${chat.messages.length} messages`);
    }

    res.json({
      success: true,
      data: chat
    });
    console.log('✅ [CHAT] Chat history sent successfully');
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
  try {
    const { message, model, attachments, contextNotes } = req.body;

    console.log('\n' + '='.repeat(80));
    console.log('🤖 [CHATBOT] User accessed chatbot');
    console.log('📊 [CHATBOT] Model requested:', model);
    console.log('💬 [CHATBOT] User query:', message);
    
    let chat = await Chat.findOne();
    if (!chat) {
      console.log('📝 [CHATBOT] Creating new chat session');
      chat = new Chat({ messages: [], currentModel: model || 'gemini-2.5-flash' });
    }

    chat.currentModel = model || chat.currentModel;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      attachments: attachments || [],
      contextNotes: contextNotes || []
    };
    chat.messages.push(userMessage);

    const contextWindow = chat.messages.slice(-21, -1).map(msg => ({
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
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
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
          inline_data: {
            mime_type: attachment.fileType,
            data: attachment.fileData
          }
        });
      });
    }

    const systemInstruction = `You are Bella, a helpful AI assistant integrated into the Pen2PDF productivity suite. You help users with their questions, provide insights from their notes, and assist with various tasks. Be concise, helpful, and friendly.`;

    console.log('🚀 [GEMINI] Sending request to model:', model);
    
    const result = await ai.models.generateContent({
      model: model,
      config: { systemInstruction },
      contents: [{ role: "user", parts }],
    });

    const responseText = result?.response?.text?.() || 
                        result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
                        'I apologize, but I could not generate a response.';

    console.log('📨 [GEMINI] Complete response from model:');
    console.log('─'.repeat(80));
    console.log(responseText);
    console.log('─'.repeat(80));

    return responseText;
  } catch (error) {
    console.error('❌ [GEMINI] API error:', error);
    
    if (error.message && error.message.includes('fetch failed')) {
      throw new Error('Network error: Unable to connect to Gemini API. Please check your internet connection.');
    }
    
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
