require("dotenv").config();

async function callLongCatAPI(model, message, contextNotes = [], chatHistory = []) {
  try {
    let contextText = '';
    if (contextNotes && contextNotes.length > 0) {
      contextText = '\n\nContext from notes:\n';
      contextNotes.forEach(note => {
        contextText += `\n--- ${note.title} ---\n${note.content}\n`;
      });
    }

    const apiKey = process.env.longcatApiKey || process.env.LONGCAT_API_KEY;
    
    if (!apiKey) {
      throw new Error('LongCat API key not configured');
    }

    const systemInstruction = `You are Isabella, a helpful AI assistant integrated into the Pen2PDF productivity suite. You help users with their questions, provide insights from their notes, and assist with various tasks. Be concise, helpful, and friendly.`;

    const messages = [
      { role: 'system', content: systemInstruction }
    ];

    if (chatHistory && chatHistory.length > 0) {
      const historyText = chatHistory.map(msg => 
        `${msg.role === 'user' ? 'User' : 'Bella'}: ${msg.content}`
      ).join('\n');
      
      messages.push({
        role: 'system',
        content: `Here is your previous chat with the user:\n\n${historyText}\n\nNow respond to their current message below.`
      });
    }

    const fullMessage = contextText + (contextText ? '\n\n' : '') + message;
    messages.push({ role: 'user', content: fullMessage });

    console.log('📋 [LONGCAT] Full prompt being sent to model:');
    console.log('─'.repeat(80));
    messages.forEach((msg, idx) => {
      console.log(`Message ${idx + 1} (${msg.role}):`);
      console.log(msg.content);
      console.log('─'.repeat(40));
    });
    console.log('─'.repeat(80));

    console.log('🚀 [LONGCAT] Sending request to model:', model);
    console.log('🌐 [LONGCAT] API endpoint: https://api.longcat.chat/openai/v1/chat/completions');

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
      console.error('❌ [LONGCAT] API error response:', errorText);
      throw new Error(`LongCat API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    console.log('📨 [LONGCAT] Complete response from model:');
    console.log('─'.repeat(80));
    console.log(JSON.stringify(data, null, 2));
    console.log('─'.repeat(80));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from LongCat API');
    }

    const responseContent = data.choices[0].message.content || 'I apologize, but I could not generate a response.';
    console.log('✅ [LONGCAT] Response content extracted successfully');
    console.log('Here is the responce from the model:',{responseContent})

    return responseContent;
  } catch (error) {
    console.error('❌ [LONGCAT] API error:', error);
    throw new Error('Failed to get response from LongCat: ' + error.message);
  }
}

module.exports = { callLongCatAPI };
