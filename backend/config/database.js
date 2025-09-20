const mongoose = require('mongoose');

// Create separate connections for different databases
const todoConnection = mongoose.createConnection('mongodb://127.0.0.1:27017/todolist');
const timetableConnection = mongoose.createConnection('mongodb://127.0.0.1:27017/timetable');
const notesConnection = mongoose.createConnection('mongodb://127.0.0.1:27017/notes');

// Handle connection events
todoConnection.on('connected', () => {
  console.log('✅ Todo database connected: mongodb://127.0.0.1:27017/todolist');
});

timetableConnection.on('connected', () => {
  console.log('✅ Timetable database connected: mongodb://127.0.0.1:27017/timetable');
});

notesConnection.on('connected', () => {
  console.log('✅ Notes database connected: mongodb://127.0.0.1:27017/notes');
});

todoConnection.on('error', (err) => {
  console.error('❌ Todo database connection error:', err);
});

timetableConnection.on('error', (err) => {
  console.error('❌ Timetable database connection error:', err);
});

notesConnection.on('error', (err) => {
  console.error('❌ Notes database connection error:', err);
});

module.exports = { todoConnection, timetableConnection, notesConnection };