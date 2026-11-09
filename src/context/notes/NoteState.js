import { useCallback, useState } from 'react';
import noteContext from './noteContext';
import { apiRequest } from '../../api';

const NoteState = ({ children, showAlert = () => {} }) => {
  const [notes, setNotes] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error

  const fail = useCallback(
    (error) => {
      if (error.status === 401) localStorage.removeItem('token');
      showAlert(error.message || 'Something went wrong', 'danger');
      return false;
    },
    [showAlert]
  );

  // Fetch all notes
  const getNote = useCallback(async () => {
    setStatus('loading');
    try {
      setNotes(await apiRequest('/notes/fetchnotes', { auth: true }));
      setStatus('ready');
    } catch (error) {
      setStatus('error');
      fail(error);
    }
  }, [fail]);

  // Add a note
  const addNote = async (title, description, tag) => {
    try {
      const note = await apiRequest('/notes/createnote', { method: 'POST', auth: true, body: { title, description, tag } });
      setNotes((prev) => [note, ...prev]);
      showAlert('Note added');
      return true;
    } catch (error) {
      return fail(error);
    }
  };

  // Delete a note
  const deleteNote = async (id) => {
    try {
      await apiRequest(`/notes/deletenote/${id}`, { method: 'DELETE', auth: true });
      setNotes((prev) => prev.filter((note) => note._id !== id));
      showAlert('Note deleted');
      return true;
    } catch (error) {
      return fail(error);
    }
  };

  // Edit a note
  const editNote = async (id, title, description, tag) => {
    try {
      const { note } = await apiRequest(`/notes/updatenote/${id}`, { method: 'PUT', auth: true, body: { title, description, tag } });
      setNotes((prev) => prev.map((n) => (n._id === id ? note : n)));
      showAlert('Note updated');
      return true;
    } catch (error) {
      return fail(error);
    }
  };

  return (
    <noteContext.Provider value={{ notes, status, addNote, deleteNote, editNote, getNote }}>{children}</noteContext.Provider>
  );
};

export default NoteState;
