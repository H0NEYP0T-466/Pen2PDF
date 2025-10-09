const TimetableEntry = require('../model/timetableData');

const getAllTimetableEntries = async (req, res) => {
  try {
    const entries = await TimetableEntry.find().sort({ day: 1, timings: 1 });
    console.log('✅ Get all timetable entries function executed successfully');
    res.json({ success: true, data: entries });
  } catch (error) {
    console.error('❌ Error in getAllTimetableEntries:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch timetable entries' });
  }
};

const createTimetableEntry = async (req, res) => {
  try {
    const { subjectName, teacherName, classNumber, classType, timings, day } = req.body;
    
    if (!subjectName || !teacherName || !classNumber || !classType || !timings || !day) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required: subjectName, teacherName, classNumber, classType, timings, day' 
      });
    }

    const newEntry = new TimetableEntry({
      subjectName,
      teacherName,
      classNumber,
      classType,
      timings,
      day
    });

    const savedEntry = await newEntry.save();
    console.log('✅ Create timetable entry function executed successfully');
    res.status(201).json({ success: true, data: savedEntry });
  } catch (error) {
    console.error('❌ Error in createTimetableEntry:', error);
    res.status(500).json({ success: false, error: 'Failed to create timetable entry' });
  }
};

const updateTimetableEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { subjectName, teacherName, classNumber, classType, timings, day } = req.body;

    if (!subjectName || !teacherName || !classNumber || !classType || !timings || !day) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required: subjectName, teacherName, classNumber, classType, timings, day' 
      });
    }

    const updatedEntry = await TimetableEntry.findByIdAndUpdate(
      id,
      { subjectName, teacherName, classNumber, classType, timings, day, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({ success: false, error: 'Timetable entry not found' });
    }

    console.log('✅ Update timetable entry function executed successfully');
    res.json({ success: true, data: updatedEntry });
  } catch (error) {
    console.error('❌ Error in updateTimetableEntry:', error);
    res.status(500).json({ success: false, error: 'Failed to update timetable entry' });
  }
};

const deleteTimetableEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEntry = await TimetableEntry.findByIdAndDelete(id);

    if (!deletedEntry) {
      return res.status(404).json({ success: false, error: 'Timetable entry not found' });
    }

    console.log('✅ Delete timetable entry function executed successfully');
    res.json({ success: true, message: 'Timetable entry deleted successfully' });
  } catch (error) {
    console.error('❌ Error in deleteTimetableEntry:', error);
    res.status(500).json({ success: false, error: 'Failed to delete timetable entry' });
  }
};

const deleteAllTimetableEntries = async (req, res) => {
  try {
    await TimetableEntry.deleteMany({});
    console.log('✅ Delete all timetable entries function executed successfully');
    res.json({ success: true, message: 'All timetable entries deleted successfully' });
  } catch (error) {
    console.error('❌ Error in deleteAllTimetableEntries:', error);
    res.status(500).json({ success: false, error: 'Failed to delete all timetable entries' });
  }
};

const importTimetableEntries = async (req, res) => {
  try {
    const { entries } = req.body;

    if (!entries || !Array.isArray(entries)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid data format. Expected an array of entries.' 
      });
    }

    const validEntries = [];
    const errors = [];

    entries.forEach((entry, index) => {
      const { subjectName, teacherName, classNumber, classType, timings, day } = entry;
      
      if (!subjectName || !teacherName || !classNumber || !classType || !timings || !day) {
        errors.push(`Row ${index + 1}: Missing required fields`);
        return;
      }

      if (!['Theory', 'Lab'].includes(classType)) {
        errors.push(`Row ${index + 1}: Invalid class type. Must be 'Theory' or 'Lab'`);
        return;
      }

      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Sat/Sun'];
      if (!validDays.includes(day)) {
        errors.push(`Row ${index + 1}: Invalid day. Must be one of: ${validDays.join(', ')}`);
        return;
      }

      validEntries.push({
        subjectName: subjectName.trim(),
        teacherName: teacherName.trim(),
        classNumber: classNumber.trim(),
        classType: classType.trim(),
        timings: timings.trim(),
        day: day.trim()
      });
    });

    if (errors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation errors in CSV data',
        details: errors
      });
    }

    await TimetableEntry.deleteMany({});
    
    const savedEntries = await TimetableEntry.insertMany(validEntries);

    console.log('✅ Import timetable entries function executed successfully');
    res.json({ 
      success: true, 
      message: `Successfully imported ${savedEntries.length} timetable entries`,
      data: savedEntries 
    });
  } catch (error) {
    console.error('❌ Error in importTimetableEntries:', error);
    res.status(500).json({ success: false, error: 'Failed to import timetable entries' });
  }
};

module.exports = {
  getAllTimetableEntries,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  deleteAllTimetableEntries,
  importTimetableEntries
};