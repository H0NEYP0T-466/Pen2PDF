const Chat = require('../model/chatData');
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
  apiKey: process.env.geminiApiKey || process.env.GEMINI_API_KEY,
});

// Get chat history
const getChatHistory = async (req, res) => {
  try {
    // Get the single chat document (we only store one conversation for single-user setup)
    let chat = await Chat.findOne();
    
    if (!chat) {
      // Create empty chat if none exists
      chat = new Chat({ messages: [], currentModel: 'gemini-2.5-flash' });
      await chat.save();
    }

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history',
      error: error.message
    });
  }
};

// Send message and get AI response
const sendMessage = async (req, res) => {
  try {
    const { message, model, attachments, contextNotes } = req.body;

    // Get the chat document
    let chat = await Chat.findOne();
    if (!chat) {
      chat = new Chat({ messages: [], currentModel: model || 'gemini-2.5-flash' });
    }

    // Update current model
    chat.currentModel = model || chat.currentModel;

    // Add user message to history
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      attachments: attachments || [],
      contextNotes: contextNotes || []
    };
    chat.messages.push(userMessage);

    // Prepare the AI request
    let aiResponse;
    
    if (model.startsWith('longcat')) {
      // LongCat models - use external API
      aiResponse = await callLongCatAPI(model, message, contextNotes);
    } else {
      // Gemini models
      aiResponse = await callGeminiAPI(model, message, attachments, contextNotes);
    }

    // Add AI response to history
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

    res.json({
      success: true,
      data: {
        userMessage,
        assistantMessage
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// Helper function to call Gemini API
async function callGeminiAPI(model, message, attachments, contextNotes) {
  try {
    // Prepare context from notes if provided
    let contextText = '';
    if (contextNotes && contextNotes.length > 0) {
      contextText = '\n\nContext from notes:\n';
      contextNotes.forEach(note => {
        contextText += `\n--- ${note.title} ---\n${note.content}\n`;
      });
    }

    const fullMessage = contextText + '\n\nUser question: ' + message;

    // Prepare parts for the API call
    const parts = [{ text: fullMessage }];

    // Add attachments if present (only for Gemini models)
    if (attachments && attachments.length > 0) {
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

    const result = await ai.models.generateContent({
      model: model,
      config: { systemInstruction },
      contents: [{ role: "user", parts }],
    });

    // Extract text from response
    const responseText = result?.response?.text?.() || 
                        result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
                        'I apologize, but I could not generate a response.';

    return responseText;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to get response from Gemini: ' + error.message);
  }
}

// Helper function to call LongCat API
async function callLongCatAPI(model, message, contextNotes) {
  try {
    // Note: This is a placeholder for LongCat API integration
    // You'll need to add the actual API endpoint and authentication
    
    // Prepare context from notes if provided
    let contextText = '';
    if (contextNotes && contextNotes.length > 0) {
      contextText = '\n\nContext from notes:\n';
      contextNotes.forEach(note => {
        contextText += `\n--- ${note.title} ---\n${note.content}\n`;
      });
    }

    // This variable is prepared for future API integration
    // eslint-disable-next-line no-unused-vars
    const fullMessage = contextText + '\n\nUser question: ' + message;

    // Placeholder response for LongCat
    // TODO: Implement actual LongCat API call when API details are available
    return `[LongCat ${model}] This is a placeholder response. LongCat API integration needs to be configured with the actual API endpoint and credentials.`;
  } catch (error) {
    console.error('LongCat API error:', error);
    throw new Error('Failed to get response from LongCat: ' + error.message);
  }
}

// Clear chat history
const clearChatHistory = async (req, res) => {
  try {
    let chat = await Chat.findOne();
    
    if (chat) {
      chat.messages = [];
      chat.updatedAt = new Date();
      await chat.save();
    }

    res.json({
      success: true,
      message: 'Chat history cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing chat history:', error);
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
