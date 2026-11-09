import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import noteContext from '../context/notes/noteContext';
import Noteitem from './Noteitem';
import Modal from 'bootstrap/js/dist/modal';
import AddNote from './AddNote';

const Notes = () => {
  const { notes, status, getNote, editNote } = useContext(noteContext);
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const [note, setNote] = useState({ eid: '', etitle: '', edescription: '', etag: '' });
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (localStorage.getItem('token')) getNote();
    else navigate('/login');
  }, [getNote, navigate]);

  // Token expired or invalid: NoteState removes it; send the user to log in.
  useEffect(() => {
    if (status === 'error' && !localStorage.getItem('token')) navigate('/login');
  }, [status, navigate]);

  const modal = () => Modal.getOrCreateInstance(modalRef.current);

  const updateNote = (currentNote) => {
    setNote({ eid: currentNote._id, etitle: currentNote.title, edescription: currentNote.description, etag: currentNote.tag });
    modal().show();
  };

  const onChange = (e) => setNote({ ...note, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await editNote(note.eid, note.etitle.trim(), note.edescription.trim(), note.etag.trim());
    if (ok) modal().hide();
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => [n.title, n.description, n.tag].some((v) => (v || '').toLowerCase().includes(q)));
  }, [notes, query]);

  const invalid = note.etitle.trim().length < 3 || note.edescription.trim().length < 5;

  return (
    <div className="row g-4">
      <div className="col-lg-4">
        <AddNote />
      </div>

      <div className="col-lg-8">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
          <div>
            <h1 className="h3 fw-bold mb-0">Your notes</h1>
            {status === 'ready' && <span className="text-body-secondary small">{notes.length} {notes.length === 1 ? 'note' : 'notes'}</span>}
          </div>
          {notes.length > 0 && (
            <div className="input-group" style={{ maxWidth: 280 }}>
              <span className="input-group-text bg-white"><i className="bi bi-search" aria-hidden="true"></i></span>
              <label htmlFor="search" className="visually-hidden">Search notes</label>
              <input id="search" type="search" className="form-control" placeholder="Search notes" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          )}
        </div>

        {status === 'loading' && (
          <div className="text-center py-5 text-body-secondary" role="status">
            <div className="spinner-border text-primary mb-2" aria-hidden="true"></div>
            <div>Loading your notes…</div>
          </div>
        )}

        {status === 'error' && (
          <div className="alert alert-danger d-flex justify-content-between align-items-center">
            <span>Couldn&apos;t load your notes.</span>
            <button type="button" className="btn btn-sm btn-outline-danger" onClick={getNote}>Try again</button>
          </div>
        )}

        {status === 'ready' && notes.length === 0 && (
          <div className="nb-empty text-center py-5 px-3">
            <i className="bi bi-journal-text display-6 text-primary" aria-hidden="true"></i>
            <p className="fw-semibold mt-2 mb-1">No notes yet</p>
            <p className="text-body-secondary mb-0">Use the form to write your first note.</p>
          </div>
        )}

        {status === 'ready' && notes.length > 0 && visible.length === 0 && (
          <p className="text-body-secondary">No notes match “{query}”.</p>
        )}

        <div className="row g-3">
          {visible.map((n) => (
            <Noteitem key={n._id} note={n} updateNote={updateNote} />
          ))}
        </div>
      </div>

      <div className="modal fade" id="editNoteModal" tabIndex="-1" aria-labelledby="editNoteLabel" aria-hidden="true" ref={modalRef}>
        <div className="modal-dialog modal-dialog-centered">
          <form className="modal-content" onSubmit={handleSubmit}>
            <div className="modal-header">
              <h2 className="modal-title fs-5" id="editNoteLabel">Edit note</h2>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="etitle" className="form-label fw-semibold">Title</label>
                <input type="text" className="form-control" name="etitle" id="etitle" value={note.etitle} onChange={onChange} required minLength={3} maxLength={200} />
              </div>
              <div className="mb-3">
                <label htmlFor="edescription" className="form-label fw-semibold">Description</label>
                <textarea className="form-control" name="edescription" id="edescription" rows={5} value={note.edescription} onChange={onChange} required minLength={5} />
              </div>
              <div className="mb-1">
                <label htmlFor="etag" className="form-label fw-semibold">Tag</label>
                <input type="text" className="form-control" name="etag" id="etag" value={note.etag} onChange={onChange} maxLength={40} />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={invalid}>Save changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Notes;
