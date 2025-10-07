const { whiteboardConnection } = require('../config/database');
const { Schema } = require('mongoose');

// Whiteboard schema to store canvas state
const whiteboardSchema = new Schema({
    elements: [{
        id: { type: String, required: true },
        type: { type: String, required: true }, // 'drawing', 'text', 'image'
        data: { type: Schema.Types.Mixed }, // Stores the specific element data
        position: {
            x: Number,
            y: Number
        },
        dimensions: {
            width: Number,
            height: Number
        },
        createdAt: { type: Date, default: Date.now }
    }],
    updatedAt: { type: Date, default: Date.now }
});

const Whiteboard = whiteboardConnection.model('Whiteboard', whiteboardSchema);

module.exports = Whiteboard;
