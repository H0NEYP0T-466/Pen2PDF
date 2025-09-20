const Notes = require('../model/notesData');
const { generateNotesResponse } = require('../gemini/notesgemini');

// Get all saved notes
const getAllNotes = async (req, res) => {
  try {
    const notes = await Notes.find().sort({ createdAt: -1 });
    console.log('✅ Get all notes function executed successfully');
    res.json({ success: true, data: notes });
  } catch (error) {
    console.error('❌ Error in getAllNotes:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notes' });
  }
};

// Create new notes entry
const createNotes = async (req, res) => {
  try {
    const { title, originalFiles, generatedNotes, modelUsed } = req.body;

    const newNotes = new Notes({
      title: title || 'Untitled Notes',
      originalFiles: originalFiles || [],
      generatedNotes,
      modelUsed: modelUsed || 'Gemini'
    });

    const savedNotes = await newNotes.save();
    console.log('✅ Create notes function executed successfully');
    res.json({ success: true, data: savedNotes });
  } catch (error) {
    console.error('❌ Error in createNotes:', error);
    res.status(500).json({ success: false, error: 'Failed to save notes' });
  }
};

// Update existing notes
const updateNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };

    const updatedNotes = await Notes.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedNotes) {
      return res.status(404).json({ success: false, error: 'Notes not found' });
    }

    console.log('✅ Update notes function executed successfully');
    res.json({ success: true, data: updatedNotes });
  } catch (error) {
    console.error('❌ Error in updateNotes:', error);
    res.status(500).json({ success: false, error: 'Failed to update notes' });
  }
};

// Delete notes
const deleteNotes = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedNotes = await Notes.findByIdAndDelete(id);
    
    if (!deletedNotes) {
      return res.status(404).json({ success: false, error: 'Notes not found' });
    }

    console.log('✅ Delete notes function executed successfully');
    res.json({ success: true, message: 'Notes deleted successfully' });
  } catch (error) {
    console.error('❌ Error in deleteNotes:', error);
    res.status(500).json({ success: false, error: 'Failed to delete notes' });
  }
};

// Generate notes from uploaded files
const generateNotes = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    const retryInstruction = req.body?.retryInstruction || null;
    const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
    const parts = [];

    // Process each uploaded file
    for (const file of files) {
      if (file.mimetype.startsWith('image/')) {
        // Handle image files
        parts.push({
          inlineData: {
            mimeType: file.mimetype,
            data: file.data.toString('base64')
          }
        });
      } else if (file.mimetype === 'text/plain' || 
                 file.mimetype === 'text/markdown' ||
                 file.name.endsWith('.md') ||
                 file.name.endsWith('.txt')) {
        // Handle text/markdown files
        const textContent = file.data.toString('utf-8');
        parts.push({ text: `File: ${file.name}\n\n${textContent}` });
      } else if (file.mimetype === 'application/pdf' ||
                 file.mimetype.includes('presentation') ||
                 file.mimetype.includes('powerpoint')) {
        // For PDF and presentation files, we'll use Gemini's file processing
        // Since Gemini can handle these directly as binary data
        parts.push({
          inlineData: {
            mimeType: file.mimetype,
            data: file.data.toString('base64')
          }
        });
      } else {
        // For other file types, try to process as binary
        parts.push({
          inlineData: {
            mimeType: file.mimetype,
            data: file.data.toString('base64')
          }
        });
      }
    }

    // Generate notes using Gemini
    const result = await generateNotesResponse(parts, retryInstruction);
    
    console.log('✅ Notes generation function executed successfully');
    res.json({ 
      success: true, 
      text: result.text,
      modelUsed: result.modelUsed,
      filesProcessed: files.map(f => f.name)
    });

  } catch (error) {
    console.error('❌ Error in generateNotes:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate notes. Please try again.' 
    });
  }
};

// Get specific notes by ID
const getNotesById = async (req, res) => {
  try {
    const { id } = req.params;
    const notes = await Notes.findById(id);
    
    if (!notes) {
      return res.status(404).json({ success: false, error: 'Notes not found' });
    }

    console.log('✅ Get notes by ID function executed successfully');
    res.json({ success: true, data: notes });
  } catch (error) {
    console.error('❌ Error in getNotesById:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notes' });
  }
};

module.exports = {
  getAllNotes,
  createNotes,
  updateNotes,
  deleteNotes,
  generateNotes,
  getNotesById
};