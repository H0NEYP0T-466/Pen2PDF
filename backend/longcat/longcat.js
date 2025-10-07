require("dotenv").config();

/**
 * LongCat API Integration
 * Handles communication with LongCat API for AI responses
 */

/**
 * Call LongCat API with message and context
 * @param {string} model - LongCat model name
 * @param {string} message - User message
 * @param {Array} contextNotes - Optional notes for context
 * @param {Array} chatHistory - Previous chat messages for context window
 * @returns {Promise<string>} - AI response
 */
async function callLongCatAPI(model, message, contextNotes = [], chatHistory = []) {
  try {
    // Prepare context from notes if provided
    let contextText = '';
    if (contextNotes && contextNotes.length > 0) {
      contextText = '\n\nContext from notes:\n';
      contextNotes.forEach(note => {
        contextText += `\n--- ${note.title} ---\n${note.content}\n`;
      });
    }

    // LongCat API uses OpenAI format
    const apiKey = process.env.longcatApiKey || process.env.LONGCAT_API_KEY;
    
    if (!apiKey) {
      throw new Error('LongCat API key not configured');
    }

    const systemInstruction = `You are Bella, a helpful AI assistant integrated into the Pen2PDF productivity suite. You help users with their questions, provide insights from their notes, and assist with various tasks. Be concise, helpful, and friendly.`;

    // Build messages array with context window
    const messages = [
      { role: 'system', content: systemInstruction }
    ];

    // Add chat history for context window
    if (chatHistory && chatHistory.length > 0) {
      const historyText = chatHistory.map(msg => 
        `${msg.role === 'user' ? 'User' : 'Bella'}: ${msg.content}`
      ).join('\n');
      
      messages.push({
        role: 'system',
        content: `Here is your previous chat with the user:\n\n${historyText}\n\nNow respond to their current message below.`
      });
    }

    // Add current user message with context
    const fullMessage = contextText + (contextText ? '\n\n' : '') + message;
    messages.push({ role: 'user', content: fullMessage });

    const response = await fetch('https://api.longcat.chat/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LongCat API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from LongCat API');
    }

    return data.choices[0].message.content || 'I apologize, but I could not generate a response.';
  } catch (error) {
    console.error('LongCat API error:', error);
    throw new Error('Failed to get response from LongCat: ' + error.message);
  }
}

module.exports = { callLongCatAPI };
