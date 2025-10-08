const Notes = require('../model/notesData');
const { generateNotesResponse } = require('../gemini/notesgemini');

const getAllNotes = async (req, res) => {
  try {
    console.log('📥 [NOTES] Get all notes request received');
    const notes = await Notes.find().sort({ createdAt: -1 });
    console.log(`✅ [NOTES] Retrieved ${notes.length} notes successfully`);
    res.json({ success: true, data: notes });
  } catch (error) {
    console.error('❌ [NOTES] Error in getAllNotes:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notes' });
  }
};

const createNotes = async (req, res) => {
  try {
    const { title, originalFiles, generatedNotes, modelUsed } = req.body;

    console.log('📝 [NOTES] Create notes request received');
    console.log('   Title:', title || 'Untitled Notes');
    console.log('   Files:', originalFiles?.length || 0);
    console.log('   Model:', modelUsed || 'Gemini');

    const newNotes = new Notes({
      title: title || 'Untitled Notes',
      originalFiles: originalFiles || [],
      generatedNotes,
      modelUsed: modelUsed || 'Gemini'
    });

    const savedNotes = await newNotes.save();
    console.log('✅ [NOTES] Notes saved successfully with ID:', savedNotes._id);
    res.json({ success: true, data: savedNotes });
  } catch (error) {
    console.error('❌ [NOTES] Error in createNotes:', error);
    res.status(500).json({ success: false, error: 'Failed to save notes' });
  }
};

const updateNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };

    console.log('📝 [NOTES] Update notes request for ID:', id);

    const updatedNotes = await Notes.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedNotes) {
      console.log('❌ [NOTES] Notes not found with ID:', id);
      return res.status(404).json({ success: false, error: 'Notes not found' });
    }

    console.log('✅ [NOTES] Notes updated successfully');
    res.json({ success: true, data: updatedNotes });
  } catch (error) {
    console.error('❌ [NOTES] Error in updateNotes:', error);
    res.status(500).json({ success: false, error: 'Failed to update notes' });
  }
};

const deleteNotes = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️  [NOTES] Delete notes request for ID:', id);

    const deletedNotes = await Notes.findByIdAndDelete(id);
    
    if (!deletedNotes) {
      console.log('❌ [NOTES] Notes not found with ID:', id);
      return res.status(404).json({ success: false, error: 'Notes not found' });
    }

    console.log('✅ [NOTES] Notes deleted successfully');
    res.json({ success: true, message: 'Notes deleted successfully' });
  } catch (error) {
    console.error('❌ [NOTES] Error in deleteNotes:', error);
    res.status(500).json({ success: false, error: 'Failed to delete notes' });
  }
};

const generateNotes = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      console.log('❌ [NOTES] No files uploaded');
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    console.log('\n' + '='.repeat(80));
    console.log('📚 [NOTES GENERATION] Notes generation request received');
    
    const retryInstruction = req.body?.retryInstruction || null;
    const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
    const parts = [];

    console.log(`📁 [NOTES GENERATION] Processing ${files.length} file(s):`);

    for (const file of files) {
      console.log(`   📄 ${file.name} (${file.mimetype}, ${(file.size / 1024).toFixed(2)} KB)`);
      
      if (file.mimetype.startsWith('image/')) {
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
        const textContent = file.data.toString('utf-8');
        parts.push({ text: `File: ${file.name}\n\n${textContent}` });
        console.log(`   📝 Text content length: ${textContent.length} characters`);
      } else if (file.mimetype === 'application/pdf' ||
                 file.mimetype.includes('presentation') ||
                 file.mimetype.includes('powerpoint')) {
        parts.push({
          inlineData: {
            mimeType: file.mimetype,
            data: file.data.toString('base64')
          }
        });
      } else {
        parts.push({
          inlineData: {
            mimeType: file.mimetype,
            data: file.data.toString('base64')
          }
        });
      }
    }

    console.log('🚀 [NOTES GENERATION] Sending to Gemini API for processing...');
    
    const result = await generateNotesResponse(parts, retryInstruction);
    
    console.log('✅ [NOTES GENERATION] Notes generated successfully');
    console.log('📊 [NOTES GENERATION] Model used:', typeof result === 'object' ? result.modelUsed : 'Gemini');
    console.log('📝 [NOTES GENERATION] Generated content length:', typeof result === 'object' ? result.text.length : result.length, 'characters');
    console.log('='.repeat(80) + '\n');
    
    const response = typeof result === 'object' 
      ? { 
          success: true, 
          text: result.text,
          modelUsed: result.modelUsed,
          filesProcessed: files.map(f => f.name)
        }
      : { 
          success: true, 
          text: result,
          modelUsed: 'Gemini',
          filesProcessed: files.map(f => f.name)
        };
        
    res.json(response);

  } catch (error) {
    console.error('❌ [NOTES GENERATION] Error:', error);
    console.log('='.repeat(80) + '\n');
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate notes. Please try again.' 
    });
  }
};

const getNotesById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📥 [NOTES] Get notes by ID request for:', id);
    
    const notes = await Notes.findById(id);
    
    if (!notes) {
      console.log('❌ [NOTES] Notes not found with ID:', id);
      return res.status(404).json({ success: false, error: 'Notes not found' });
    }

    console.log('✅ [NOTES] Notes retrieved successfully');
    res.json({ success: true, data: notes });
  } catch (error) {
    console.error('❌ [NOTES] Error in getNotesById:', error);
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