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
  limits: { fileSize: 50 * 1024 * 1024 }
}));

app.use((req, res, next) => {
  console.log(`\n📡 [API] ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 [API] Body:', JSON.stringify(req.body, null, 2).substring(0, 200));
  }
  next();
});

app.get('/', (req, res) => {
  console.log("📥 [API] Frontend health check received");
  res.send('Hello World!');
});

app.post('/textExtract', generateRES);

app.post('/notesGenerate', generateNotes);

app.get('/api/todos', getAllTodos);
app.post('/api/todos', createTodoCard);
app.put('/api/todos/:id', updateTodoCard);
app.delete('/api/todos/:id', deleteTodoCard);
app.post('/api/todos/:id/subtodos', addSubTodo);
app.put('/api/todos/:id/subtodos/:subTodoId', updateSubTodo);
app.delete('/api/todos/:id/subtodos/:subTodoId', deleteSubTodo);

app.get('/api/timetable', getAllTimetableEntries);
app.post('/api/timetable', createTimetableEntry);
app.put('/api/timetable/:id', updateTimetableEntry);
app.delete('/api/timetable/:id', deleteTimetableEntry);
app.delete('/api/timetable', deleteAllTimetableEntries);
app.post('/api/timetable/import', importTimetableEntries);

app.get('/api/notes', getAllNotes);
app.post('/api/notes', createNotes);
app.get('/api/notes/:id', getNotesById);
app.put('/api/notes/:id', updateNotes);
app.delete('/api/notes/:id', deleteNotes);

app.get('/api/chat', getChatHistory);
app.post('/api/chat/message', sendMessage);
app.delete('/api/chat', clearChatHistory);

Promise.all([
  todoConnection.asPromise(),
  timetableConnection.asPromise(),
  notesConnection.asPromise(),
  chatConnection.asPromise()
]).then(() => {
  console.log('🚀 All MongoDB connections established');
  app.listen(8000, () => console.log('🌟 Server running on port 8000'));
}).catch(err => {
  console.error('❌ Database connection failed:', err);
  process.exit(1);
});
