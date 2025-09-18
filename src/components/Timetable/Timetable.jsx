import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import axios from 'axios';
import './Timetable.css';

function Timetable() {
  const navigate = useNavigate();
  const [timetableEntries, setTimetableEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingEntry, setEditingEntry] = useState(null);
  const [newEntry, setNewEntry] = useState({
    subjectName: '',
    teacherName: '',
    classNumber: '',
    classType: 'Theory',
    timings: '',
    day: 'Monday'
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [importError, setImportError] = useState('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Sat/Sun'];
  const classTypes = ['Theory', 'Lab'];

  useEffect(() => {
    fetchTimetableEntries();
  }, []);

  const fetchTimetableEntries = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/timetable');
      if (response.data.success) {
        setTimetableEntries(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching timetable entries:', error);
      setError('Failed to fetch timetable entries. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/timetable', newEntry);
      if (response.data.success) {
        setTimetableEntries([...timetableEntries, response.data.data]);
        setNewEntry({
          subjectName: '',
          teacherName: '',
          classNumber: '',
          classType: 'Theory',
          timings: '',
          day: 'Monday'
        });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding entry:', error);
      setError('Failed to add timetable entry');
    }
  };

  const handleUpdateEntry = async (id, updatedEntry) => {
    try {
      const response = await axios.put(`http://localhost:8000/api/timetable/${id}`, updatedEntry);
      if (response.data.success) {
        setTimetableEntries(timetableEntries.map(entry => 
          entry._id === id ? response.data.data : entry
        ));
        setEditingEntry(null);
      }
    } catch (error) {
      console.error('Error updating entry:', error);
      setError('Failed to update timetable entry');
    }
  };

  const handleDeleteEntry = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const response = await axios.delete(`http://localhost:8000/api/timetable/${id}`);
        if (response.data.success) {
          setTimetableEntries(timetableEntries.filter(entry => entry._id !== id));
        }
      } catch (error) {
        console.error('Error deleting entry:', error);
        setError('Failed to delete timetable entry');
      }
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete the entire timetable? This action cannot be undone.')) {
      try {
        const response = await axios.delete('http://localhost:8000/api/timetable');
        if (response.data.success) {
          setTimetableEntries([]);
        }
      } catch (error) {
        console.error('Error deleting all entries:', error);
        setError('Failed to delete all timetable entries');
      }
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setImportError('Please select a CSV file');
      return;
    }

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setImportError('');
        
        // Validate CSV structure
        const requiredHeaders = ['Subject Name', 'Teacher Name', 'Class Number', 'Class Type', 'Timings', 'Day'];
        const headers = Object.keys(results.data[0] || {});
        
        const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
        if (missingHeaders.length > 0) {
          setImportError(`Missing required columns: ${missingHeaders.join(', ')}`);
          return;
        }

        // Transform CSV data to match backend schema
        const transformedData = results.data
          .filter(row => row['Subject Name'] && row['Teacher Name']) // Filter empty rows
          .map(row => ({
            subjectName: row['Subject Name'],
            teacherName: row['Teacher Name'],
            classNumber: row['Class Number'],
            classType: row['Class Type'],
            timings: row['Timings'],
            day: row['Day']
          }));

        if (transformedData.length === 0) {
          setImportError('No valid data found in CSV file');
          return;
        }

        importTimetableData(transformedData);
      },
      error: (error) => {
        setImportError('Error parsing CSV file: ' + error.message);
      }
    });

    // Reset file input
    event.target.value = '';
  };

  const importTimetableData = async (data) => {
    try {
      const response = await axios.post('http://localhost:8000/api/timetable/import', { entries: data });
      if (response.data.success) {
        await fetchTimetableEntries();
        setImportError('');
        alert(`Successfully imported ${response.data.data.length} entries`);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      if (error.response?.data?.details) {
        setImportError(`Import failed: ${error.response.data.details.join(', ')}`);
      } else {
        setImportError('Failed to import timetable data');
      }
    }
  };

  const groupedEntries = timetableEntries.reduce((acc, entry) => {
    if (!acc[entry.day]) {
      acc[entry.day] = [];
    }
    acc[entry.day].push(entry);
    return acc;
  }, {});

  const EditForm = ({ entry, onSave, onCancel }) => {
    const [formData, setFormData] = useState(entry);

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(entry._id, formData);
    };

    return (
      <tr className="edit-row">
        <td colSpan="7">
          <form onSubmit={handleSubmit} className="edit-form">
            <div className="form-row">
              <input
                type="text"
                value={formData.subjectName}
                onChange={(e) => setFormData({...formData, subjectName: e.target.value})}
                placeholder="Subject Name"
                required
              />
              <input
                type="text"
                value={formData.teacherName}
                onChange={(e) => setFormData({...formData, teacherName: e.target.value})}
                placeholder="Teacher Name"
                required
              />
              <input
                type="text"
                value={formData.classNumber}
                onChange={(e) => setFormData({...formData, classNumber: e.target.value})}
                placeholder="Class Number"
                required
              />
              <select
                value={formData.classType}
                onChange={(e) => setFormData({...formData, classType: e.target.value})}
                required
              >
                {classTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <input
                type="text"
                value={formData.timings}
                onChange={(e) => setFormData({...formData, timings: e.target.value})}
                placeholder="Timings"
                required
              />
              <select
                value={formData.day}
                onChange={(e) => setFormData({...formData, day: e.target.value})}
                required
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <div className="form-actions">
                <button type="submit" className="btn primary small">Save</button>
                <button type="button" onClick={onCancel} className="btn outline small">Cancel</button>
              </div>
            </div>
          </form>
        </td>
      </tr>
    );
  };

  if (loading) {
    return <div className="loading">Loading timetable...</div>;
  }

  return (
    <div className="timetable-container">
      <div className="timetable-header">
        <div className="header-left">
          <button 
            className="btn outline" 
            onClick={() => navigate('/')}
            title="Back to Home"
          >
            ← Back
          </button>
          <h1>Class Timetable</h1>
        </div>
        <div className="header-actions">
          <input
            type="file"
            id="csv-upload"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <label htmlFor="csv-upload" className="btn outline">
            Import CSV
          </label>
          <button 
            className="btn primary" 
            onClick={() => setShowAddForm(true)}
          >
            Add Entry
          </button>
          <button 
            className="btn danger" 
            onClick={handleDeleteAll}
            disabled={timetableEntries.length === 0}
          >
            Delete All
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="close-btn">×</button>
        </div>
      )}

      {importError && (
        <div className="error-message">
          {importError}
          <button onClick={() => setImportError('')} className="close-btn">×</button>
        </div>
      )}

      {showAddForm && (
        <div className="add-form-container">
          <h3>Add New Timetable Entry</h3>
          <form onSubmit={handleAddEntry} className="add-form">
            <div className="form-row">
              <input
                type="text"
                value={newEntry.subjectName}
                onChange={(e) => setNewEntry({...newEntry, subjectName: e.target.value})}
                placeholder="Subject Name"
                required
              />
              <input
                type="text"
                value={newEntry.teacherName}
                onChange={(e) => setNewEntry({...newEntry, teacherName: e.target.value})}
                placeholder="Teacher Name"
                required
              />
              <input
                type="text"
                value={newEntry.classNumber}
                onChange={(e) => setNewEntry({...newEntry, classNumber: e.target.value})}
                placeholder="Class Number"
                required
              />
              <select
                value={newEntry.classType}
                onChange={(e) => setNewEntry({...newEntry, classType: e.target.value})}
                required
              >
                {classTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <input
                type="text"
                value={newEntry.timings}
                onChange={(e) => setNewEntry({...newEntry, timings: e.target.value})}
                placeholder="Timings (e.g., 08:00 - 09:30)"
                required
              />
              <select
                value={newEntry.day}
                onChange={(e) => setNewEntry({...newEntry, day: e.target.value})}
                required
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <div className="form-actions">
                <button type="submit" className="btn primary">Add</button>
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)} 
                  className="btn outline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="timetable-table-container">
        <table className="timetable-table">
          <thead>
            <tr>
              <th>Subject Name</th>
              <th>Teacher Name</th>
              <th>Class Number</th>
              <th>Class Type</th>
              <th>Timings</th>
              <th>Day</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {timetableEntries.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  No timetable entries found. Add some entries or import from CSV.
                </td>
              </tr>
            ) : (
              days.map(day => {
                const dayEntries = groupedEntries[day] || [];
                return dayEntries.map((entry, index) => (
                  <React.Fragment key={entry._id}>
                    {editingEntry === entry._id ? (
                      <EditForm
                        entry={entry}
                        onSave={handleUpdateEntry}
                        onCancel={() => setEditingEntry(null)}
                      />
                    ) : (
                      <tr>
                        <td>{entry.subjectName}</td>
                        <td>{entry.teacherName}</td>
                        <td>{entry.classNumber}</td>
                        <td>
                          <span className={`class-type ${entry.classType.toLowerCase()}`}>
                            {entry.classType}
                          </span>
                        </td>
                        <td>{entry.timings}</td>
                        <td>
                          <span className="day-badge">{entry.day}</span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn outline small"
                              onClick={() => setEditingEntry(entry._id)}
                              title="Edit entry"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn danger small"
                              onClick={() => handleDeleteEntry(entry._id)}
                              title="Delete entry"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ));
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="csv-format-info">
        <h3>CSV Import Format</h3>
        <p>Your CSV file should have the following columns (in this exact order):</p>
        <code>Subject Name, Teacher Name, Class Number, Class Type, Timings, Day</code>
        <p>
          <strong>Class Type</strong> should be either "Theory" or "Lab".<br/>
          <strong>Day</strong> should be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday, or Sat/Sun.
        </p>
      </div>
    </div>
  );
}

export default Timetable;