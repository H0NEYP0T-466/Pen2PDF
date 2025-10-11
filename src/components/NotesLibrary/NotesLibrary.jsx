import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ConfirmDialog from '../ui/ConfirmDialog';
import './NotesLibrary.css';

function NotesLibrary() {
  const navigate = useNavigate();
  const [savedNotes, setSavedNotes] = useState([]);
  const [notesSearchQuery, setNotesSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

  useEffect(() => {
    fetchSavedNotes();
  }, []);

  const fetchSavedNotes = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/notes');
      if (response.data.success) {
        setSavedNotes(response.data.data);
      }
    } catch {
      setError('Failed to fetch notes');
    }
  };

  const openDeleteDialog = (noteId) => {
    setNoteToDelete(noteId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!noteToDelete) return;

    try {
      const response = await axios.delete(`http://localhost:8000/api/notes/${noteToDelete}`);
      
      if (response.data.success) {
        setSavedNotes(prev => prev.filter(note => note._id !== noteToDelete));
      } else {
        setError('Failed to delete note');
      }
    } catch {
      setError('Failed to delete note');
    } finally {
      setDeleteDialogOpen(false);
      setNoteToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setNoteToDelete(null);
  };

  const editNote = (note) => {
    navigate('/notes', { 
      state: { 
        extractedText: note.generatedNotes,
        fileName: note.title,
        modelUsed: note.modelUsed,
        extracted: true
      }
    });
  };

  const filteredNotes = notesSearchQuery.trim()
    ? savedNotes.filter(note =>
        note.title.toLowerCase().includes(notesSearchQuery.toLowerCase()) ||
        note.generatedNotes.toLowerCase().includes(notesSearchQuery.toLowerCase())
      )
    : savedNotes;

  return (
    <div className="notes-container">
      <div className="notes-header">
        <div className="header-left">
          <button 
            className="back-btn"
            onClick={() => navigate('/')}
            title="Back to main page"
          >
            ←
          </button>
          <h1>Notes Library</h1>
        </div>
        <button 
          className="btn outline"
          onClick={() => navigate('/notes')}
        >
          New Notes
        </button>
      </div>

      <div className="notes-search-container">
        <input
          type="text"
          placeholder="Search Notes..."
          value={notesSearchQuery}
          onChange={(e) => setNotesSearchQuery(e.target.value)}
          className="notes-search-input"
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="library-grid">
        {filteredNotes.length === 0 ? (
          <div className="empty-state">
            <p>{notesSearchQuery.trim() ? 'No notes found matching your search.' : 'No saved notes yet. Create your first study notes!'}</p>
          </div>
        ) : (
          filteredNotes.map(note => (
            <div key={note._id} className="note-card">
              <h3>{note.title}</h3>
              <p className="note-meta">
                Created: {new Date(note.createdAt).toLocaleDateString()}
              </p>
              <p className="note-meta">
                Files: {note.originalFiles?.join(', ') || 'N/A'}
              </p>
              <p className="note-meta">
                Model: {note.modelUsed}
              </p>
              <div className="note-actions">
                <button 
                  className="btn outline small"
                  onClick={() => editNote(note)}
                >
                  Edit
                </button>
                <button 
                  className="btn danger small"
                  onClick={() => openDeleteDialog(note._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}

export default NotesLibrary;
