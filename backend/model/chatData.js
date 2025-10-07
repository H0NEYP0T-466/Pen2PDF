const { chatConnection } = require('../config/database');
const { Schema } = require('mongoose');

// Chat history schema to store AI Assistant conversations
const chatSchema = new Schema({
    messages: [{
        id: { type: String, required: true },
        role: { type: String, required: true }, // 'user' or 'assistant'
        content: { type: String, required: true },
        model: { type: String }, // Which model was used for this response
        timestamp: { type: Date, default: Date.now },
        attachments: [{ // For file uploads with Gemini models
            fileName: String,
            fileType: String,
            fileData: String // Base64 encoded
        }],
        contextNotes: [{ // Notes used as context
            noteId: String,
            title: String,
            content: String
        }]
    }],
    currentModel: { type: String, default: 'gemini-2.5-flash' },
    updatedAt: { type: Date, default: Date.now }
});

const Chat = chatConnection.model('Chat', chatSchema);

module.exports = Chat;
