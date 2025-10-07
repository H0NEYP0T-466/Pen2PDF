const Whiteboard = require('../model/whiteboardData');

// Get the whiteboard state
const getWhiteboard = async (req, res) => {
  try {
    // Get the single whiteboard document (we only store one state for single-user setup)
    let whiteboard = await Whiteboard.findOne();
    
    if (!whiteboard) {
      // Create empty whiteboard if none exists
      whiteboard = new Whiteboard({ elements: [] });
      await whiteboard.save();
    }

    res.json({
      success: true,
      data: whiteboard
    });
  } catch (error) {
    console.error('Error fetching whiteboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch whiteboard',
      error: error.message
    });
  }
};

// Save the whiteboard state
const saveWhiteboard = async (req, res) => {
  try {
    const { elements } = req.body;

    // Update or create the single whiteboard document
    let whiteboard = await Whiteboard.findOne();
    
    if (whiteboard) {
      whiteboard.elements = elements;
      whiteboard.updatedAt = new Date();
      await whiteboard.save();
    } else {
      whiteboard = new Whiteboard({ elements });
      await whiteboard.save();
    }

    res.json({
      success: true,
      data: whiteboard,
      message: 'Whiteboard saved successfully'
    });
  } catch (error) {
    console.error('Error saving whiteboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save whiteboard',
      error: error.message
    });
  }
};

// Clear the whiteboard
const clearWhiteboard = async (req, res) => {
  try {
    let whiteboard = await Whiteboard.findOne();
    
    if (whiteboard) {
      whiteboard.elements = [];
      whiteboard.updatedAt = new Date();
      await whiteboard.save();
    }

    res.json({
      success: true,
      message: 'Whiteboard cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing whiteboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear whiteboard',
      error: error.message
    });
  }
};

module.exports = {
  getWhiteboard,
  saveWhiteboard,
  clearWhiteboard
};
