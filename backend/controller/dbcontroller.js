const TodoCard = require('../model/userData');

// Get all todo cards
const getAllTodos = async (req, res) => {
  try {
    const todos = await TodoCard.find().sort({ createdAt: -1 });
    console.log('✅ Get all todos function executed successfully');
    res.json({ success: true, data: todos });
  } catch (error) {
    console.error('❌ Error in getAllTodos:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch todos' });
  }
};

// Create a new todo card
const createTodoCard = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const newTodoCard = new TodoCard({
      title,
      subTodos: []
    });

    const savedTodo = await newTodoCard.save();
    console.log('✅ Create todo card function executed successfully');
    res.status(201).json({ success: true, data: savedTodo });
  } catch (error) {
    console.error('❌ Error in createTodoCard:', error);
    res.status(500).json({ success: false, error: 'Failed to create todo card' });
  }
};

// Update todo card title
const updateTodoCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const updatedTodo = await TodoCard.findByIdAndUpdate(
      id,
      { title, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ success: false, error: 'Todo card not found' });
    }

    console.log('✅ Update todo card function executed successfully');
    res.json({ success: true, data: updatedTodo });
  } catch (error) {
    console.error('❌ Error in updateTodoCard:', error);
    res.status(500).json({ success: false, error: 'Failed to update todo card' });
  }
};

// Delete todo card
const deleteTodoCard = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTodo = await TodoCard.findByIdAndDelete(id);

    if (!deletedTodo) {
      return res.status(404).json({ success: false, error: 'Todo card not found' });
    }

    console.log('✅ Delete todo card function executed successfully');
    res.json({ success: true, message: 'Todo card deleted successfully' });
  } catch (error) {
    console.error('❌ Error in deleteTodoCard:', error);
    res.status(500).json({ success: false, error: 'Failed to delete todo card' });
  }
};

// Add sub-todo to a card
const addSubTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'Sub-todo text is required' });
    }

    const todoCard = await TodoCard.findById(id);
    if (!todoCard) {
      return res.status(404).json({ success: false, error: 'Todo card not found' });
    }

    todoCard.subTodos.push({ text });
    todoCard.updatedAt = new Date();
    await todoCard.save();

    console.log('✅ Add sub-todo function executed successfully');
    res.json({ success: true, data: todoCard });
  } catch (error) {
    console.error('❌ Error in addSubTodo:', error);
    res.status(500).json({ success: false, error: 'Failed to add sub-todo' });
  }
};

// Update sub-todo
const updateSubTodo = async (req, res) => {
  try {
    const { id, subTodoId } = req.params;
    const { text, completed } = req.body;

    const todoCard = await TodoCard.findById(id);
    if (!todoCard) {
      return res.status(404).json({ success: false, error: 'Todo card not found' });
    }

    const subTodo = todoCard.subTodos.id(subTodoId);
    if (!subTodo) {
      return res.status(404).json({ success: false, error: 'Sub-todo not found' });
    }

    if (text !== undefined) subTodo.text = text;
    if (completed !== undefined) subTodo.completed = completed;
    todoCard.updatedAt = new Date();
    
    await todoCard.save();

    console.log('✅ Update sub-todo function executed successfully');
    res.json({ success: true, data: todoCard });
  } catch (error) {
    console.error('❌ Error in updateSubTodo:', error);
    res.status(500).json({ success: false, error: 'Failed to update sub-todo' });
  }
};

// Delete sub-todo
const deleteSubTodo = async (req, res) => {
  try {
    const { id, subTodoId } = req.params;

    const todoCard = await TodoCard.findById(id);
    if (!todoCard) {
      return res.status(404).json({ success: false, error: 'Todo card not found' });
    }

    todoCard.subTodos.pull(subTodoId);
    todoCard.updatedAt = new Date();
    await todoCard.save();

    console.log('✅ Delete sub-todo function executed successfully');
    res.json({ success: true, data: todoCard });
  } catch (error) {
    console.error('❌ Error in deleteSubTodo:', error);
    res.status(500).json({ success: false, error: 'Failed to delete sub-todo' });
  }
};

module.exports = {
  getAllTodos,
  createTodoCard,
  updateTodoCard,
  deleteTodoCard,
  addSubTodo,
  updateSubTodo,
  deleteSubTodo
};
