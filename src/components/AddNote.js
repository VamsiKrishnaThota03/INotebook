import React, { useContext, useState } from 'react';
import noteContext from '../context/notes/noteContext';

const EMPTY = { title: '', description: '', tag: '' };

const AddNote = () => {
  const { addNote } = useContext(noteContext);
  const [note, setNote] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const onChange = (e) => setNote({ ...note, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const ok = await addNote(note.title.trim(), note.description.trim(), note.tag.trim());
    setSaving(false);
    if (ok) setNote(EMPTY);
  };

  const invalid = note.title.trim().length < 3 || note.description.trim().length < 5;

  return (
    <section className="nb-card p-4 nb-sticky">
      <h2 className="h5 fw-bold mb-3">
        <i className="bi bi-plus-circle me-2 text-primary" aria-hidden="true"></i>New note
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label fw-semibold">Title</label>
          <input type="text" className="form-control" name="title" id="title" value={note.title} onChange={onChange} required minLength={3} maxLength={200} placeholder="Grocery list" />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label fw-semibold">Description</label>
          <textarea className="form-control" name="description" id="description" rows={4} value={note.description} onChange={onChange} required minLength={5} placeholder="Milk, eggs, bread…" />
        </div>
        <div className="mb-3">
          <label htmlFor="tag" className="form-label fw-semibold">
            Tag <span className="text-body-secondary fw-normal">(optional)</span>
          </label>
          <input type="text" className="form-control" name="tag" id="tag" value={note.tag} onChange={onChange} maxLength={40} placeholder="General" />
        </div>
        <button disabled={invalid || saving} type="submit" className="btn btn-primary w-100">
          {saving ? 'Saving…' : 'Add note'}
        </button>
        <div className="form-text">Title needs 3+ characters, description 5+.</div>
      </form>
    </section>
  );
};

export default AddNote;
