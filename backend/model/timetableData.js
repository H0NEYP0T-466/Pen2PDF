const mongoose = require('mongoose');
const { Schema } = mongoose;

// Timetable entry schema
const timetableEntrySchema = new Schema({
    subjectName: { type: String, required: true },
    teacherName: { type: String, required: true },
    classNumber: { type: String, required: true },
    classType: { type: String, required: true, enum: ['Theory', 'Lab'] },
    timings: { type: String, required: true },
    day: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Sat/Sun'] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const TimetableEntry = mongoose.model('TimetableEntry', timetableEntrySchema);

module.exports = TimetableEntry;