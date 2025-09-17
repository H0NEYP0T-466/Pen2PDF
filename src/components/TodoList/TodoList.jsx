import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TodoList.css';

function TodoList() {
  const [todoCards, setTodoCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/todos');
      if (response.data.success) {
        setTodoCards(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
      setError('Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  };

  const createNewCard = async () => {
    const title = prompt('Enter todo card title:');
    if (!title || title.trim() === '') return;

    try {
      const response = await axios.post('http://localhost:8000/api/todos', {
        title: title.trim()
      });
      if (response.data.success) {
        setTodoCards(prev => [response.data.data, ...prev]);
      }
    } catch (error) {
      console.error('Error creating todo card:', error);
      setError('Failed to create todo card');
    }
  };

  const updateCardTitle = async (cardId, newTitle) => {
    if (!newTitle || newTitle.trim() === '') return;

    try {
      const response = await axios.put(`http://localhost:8000/api/todos/${cardId}`, {
        title: newTitle.trim()
      });
      if (response.data.success) {
        setTodoCards(prev => prev.map(card => 
          card._id === cardId ? response.data.data : card
        ));
      }
    } catch (error) {
      console.error('Error updating card title:', error);
      setError('Failed to update card title');
    }
  };

  const deleteCard = async (cardId) => {
    if (!confirm('Are you sure you want to delete this todo card?')) return;

    try {
      const response = await axios.delete(`http://localhost:8000/api/todos/${cardId}`);
      if (response.data.success) {
        setTodoCards(prev => prev.filter(card => card._id !== cardId));
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      setError('Failed to delete card');
    }
  };

  const addSubTodo = async (cardId) => {
    const text = prompt('Enter sub-todo text:');
    if (!text || text.trim() === '') return;

    try {
      const response = await axios.post(`http://localhost:8000/api/todos/${cardId}/subtodos`, {
        text: text.trim()
      });
      if (response.data.success) {
        setTodoCards(prev => prev.map(card => 
          card._id === cardId ? response.data.data : card
        ));
      }
    } catch (error) {
      console.error('Error adding sub-todo:', error);
      setError('Failed to add sub-todo');
    }
  };

  const updateSubTodo = async (cardId, subTodoId, updates) => {
    try {
      const response = await axios.put(`http://localhost:8000/api/todos/${cardId}/subtodos/${subTodoId}`, updates);
      if (response.data.success) {
        setTodoCards(prev => prev.map(card => 
          card._id === cardId ? response.data.data : card
        ));
      }
    } catch (error) {
      console.error('Error updating sub-todo:', error);
      setError('Failed to update sub-todo');
    }
  };

  const deleteSubTodo = async (cardId, subTodoId) => {
    if (!confirm('Are you sure you want to delete this sub-todo?')) return;

    try {
      const response = await axios.delete(`http://localhost:8000/api/todos/${cardId}/subtodos/${subTodoId}`);
      if (response.data.success) {
        setTodoCards(prev => prev.map(card => 
          card._id === cardId ? response.data.data : card
        ));
      }
    } catch (error) {
      console.error('Error deleting sub-todo:', error);
      setError('Failed to delete sub-todo');
    }
  };

  const handleSubTodoEdit = (cardId, subTodoId, currentText) => {
    const newText = prompt('Edit sub-todo:', currentText);
    if (newText !== null && newText.trim() !== currentText) {
      updateSubTodo(cardId, subTodoId, { text: newText.trim() });
    }
  };

  const toggleSubTodoComplete = (cardId, subTodoId, completed) => {
    updateSubTodo(cardId, subTodoId, { completed: !completed });
  };

  const handleCardTitleEdit = (cardId, currentTitle) => {
    const newTitle = prompt('Edit card title:', currentTitle);
    if (newTitle !== null && newTitle.trim() !== currentTitle) {
      updateCardTitle(cardId, newTitle);
    }
  };

  if (loading) {
    return (
      <div className="todo-container">
        <div className="loading">Loading todos...</div>
      </div>
    );
  }

  return (
    <div className="todo-container">
      <div className="todo-header">
        <h1>To-Do List</h1>
        <button 
          className="btn primary add-card-btn"
          onClick={createNewCard}
          title="Add new todo card"
        >
          <span className="plus-icon">+</span>
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="todo-cards-container">
        {todoCards.length === 0 ? (
          <div className="empty-state">
            <p>No todo cards yet. Click the + button to create your first one!</p>
          </div>
        ) : (
          todoCards.map(card => (
            <div key={card._id} className="todo-card">
              <div className="card-header">
                <h2 
                  className="card-title"
                  onClick={() => handleCardTitleEdit(card._id, card.title)}
                  title="Click to edit title"
                >
                  {card.title}
                </h2>
                <div className="card-actions">
                  <button 
                    className="btn outline small"
                    onClick={() => addSubTodo(card._id)}
                    title="Add sub-todo"
                  >
                    <span className="plus-icon">+</span>
                  </button>
                  <button 
                    className="btn danger small"
                    onClick={() => deleteCard(card._id)}
                    title="Delete card"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="sub-todos-container">
                {card.subTodos.length === 0 ? (
                  <div className="empty-subtodos">
                    <p>No sub-todos yet. Click + to add one!</p>
                  </div>
                ) : (
                  card.subTodos.map(subTodo => (
                    <div key={subTodo._id} className={`sub-todo ${subTodo.completed ? 'completed' : ''}`}>
                      <div className="sub-todo-content">
                        <input
                          type="checkbox"
                          checked={subTodo.completed}
                          onChange={() => toggleSubTodoComplete(card._id, subTodo._id, subTodo.completed)}
                          className="sub-todo-checkbox"
                        />
                        <span 
                          className="sub-todo-text"
                          onClick={() => handleSubTodoEdit(card._id, subTodo._id, subTodo.text)}
                          title="Click to edit"
                        >
                          {subTodo.text}
                        </span>
                      </div>
                      <div className="sub-todo-actions">
                        <button 
                          className="btn outline small"
                          onClick={() => handleSubTodoEdit(card._id, subTodo._id, subTodo.text)}
                          title="Edit sub-todo"
                        >
                          ✎
                        </button>
                        <button 
                          className="btn danger small"
                          onClick={() => deleteSubTodo(card._id, subTodo._id)}
                          title="Delete sub-todo"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TodoList;