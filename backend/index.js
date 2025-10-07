const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { generateRES } = require('./controller/controller');
const {
  getAllTodos,
  createTodoCard,
  updateTodoCard,
  deleteTodoCard,
  addSubTodo,
  updateSubTodo,
  deleteSubTodo
} = require('./controller/dbcontroller');
const {
  getAllTimetableEntries,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  deleteAllTimetableEntries,
  importTimetableEntries
} = require('./controller/timetableController');
const {
  getAllNotes,
  createNotes,
  updateNotes,
  deleteNotes,
  generateNotes,
  getNotesById
} = require('./controller/notesController');
const {
  getChatHistory,
  sendMessage,
  clearChatHistory
} = require('./controller/chatController');
const { todoConnection, timetableConnection, notesConnection, chatConnection } = require('./config/database');

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload({ 
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for file uploads
})); 

app.get('/', (req, res) => {
  console.log("Frontend call received at backend");
  res.send('Hello World!');
});

// Text extraction endpoint
app.post('/textExtract', generateRES);

// Notes generation endpoint
app.post('/notesGenerate', generateNotes);

// Todo API endpoints
app.get('/api/todos', getAllTodos);
app.post('/api/todos', createTodoCard);
app.put('/api/todos/:id', updateTodoCard);
app.delete('/api/todos/:id', deleteTodoCard);
app.post('/api/todos/:id/subtodos', addSubTodo);
app.put('/api/todos/:id/subtodos/:subTodoId', updateSubTodo);
app.delete('/api/todos/:id/subtodos/:subTodoId', deleteSubTodo);

// Timetable API endpoints
app.get('/api/timetable', getAllTimetableEntries);
app.post('/api/timetable', createTimetableEntry);
app.put('/api/timetable/:id', updateTimetableEntry);
app.delete('/api/timetable/:id', deleteTimetableEntry);
app.delete('/api/timetable', deleteAllTimetableEntries);
app.post('/api/timetable/import', importTimetableEntries);

// Notes API endpoints
app.get('/api/notes', getAllNotes);
app.post('/api/notes', createNotes);
app.get('/api/notes/:id', getNotesById);
app.put('/api/notes/:id', updateNotes);
app.delete('/api/notes/:id', deleteNotes);

// Chat API endpoints
app.get('/api/chat', getChatHistory);
app.post('/api/chat/message', sendMessage);
app.delete('/api/chat', clearChatHistory);

// Start server when all database connections are ready
Promise.all([
  todoConnection.asPromise(),
  timetableConnection.asPromise(),
  notesConnection.asPromise(),
  chatConnection.asPromise()
]).then(() => {
  console.log('🚀 All MongoDB connections established');
  app.listen(8000, () => console.log('🌟 Server running on port 8000'));
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});
