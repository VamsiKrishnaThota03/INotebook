import React, { useContext } from 'react';
import noteContext from '../context/notes/noteContext';

const formatDate = (d) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

const Noteitem = ({ note, updateNote }) => {
  const { deleteNote } = useContext(noteContext);

  const handleDelete = () => {
    if (window.confirm(`Delete "${note.title}"?`)) deleteNote(note._id);
  };

  return (
    <div className="col-sm-6 col-xl-4">
      <article className="card note-card">
        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
            <h3 className="h6 fw-bold mb-0 text-break">{note.title}</h3>
            <div className="d-flex flex-shrink-0">
              <button type="button" className="icon-btn" aria-label={`Edit ${note.title}`} title="Edit" onClick={() => updateNote(note)}>
                <i className="bi bi-pencil-square" aria-hidden="true"></i>
              </button>
              <button type="button" className="icon-btn danger" aria-label={`Delete ${note.title}`} title="Delete" onClick={handleDelete}>
                <i className="bi bi-trash3" aria-hidden="true"></i>
              </button>
            </div>
          </div>
          <p className="card-text note-desc small flex-grow-1">{note.description}</p>
          <div className="d-flex justify-content-between align-items-center mt-2">
            <span className="badge rounded-pill note-tag">{note.tag || 'General'}</span>
            <span className="small text-body-secondary">{formatDate(note.date)}</span>
          </div>
        </div>
      </article>
    </div>
  );
};

export default Noteitem;
