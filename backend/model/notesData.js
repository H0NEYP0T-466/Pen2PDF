const { notesConnection } = require('../config/database');
const { Schema } = require('mongoose');

// Notes schema to store user uploaded files and AI generated notes
const notesSchema = new Schema({
    title: { type: String, required: true },
    originalFiles: [{ type: String }], // Array of original file names
    originalFilesData: [{ 
        fileName: String,
        fileType: String,
        fileSize: Number,
        uploadDate: { type: Date, default: Date.now }
    }],
    generatedNotes: { type: String, required: true }, // AI generated notes in markdown
    modelUsed: { type: String, default: 'Gemini' }, // AI model used for generation
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Notes = notesConnection.model('Notes', notesSchema);

module.exports = Notes;