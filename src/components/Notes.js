import React, { useContext, useEffect, useRef, useState } from 'react'
import noteContext from "../context/notes/noteContext"
import Noteitem from './Noteitem';
import AddNote from './AddNote';
import { useNavigate } from 'react-router-dom';

const Notes = () => {
    const context = useContext(noteContext);
    const { notes, getNote, editNote } = context;
    let history = useNavigate();


    useEffect(() => {
        if(localStorage.getItem('token'))
        {
            getNote();
        }
        else
        {
            history('/login');
        }
    }, [])


    const ref = useRef(null)
    const refClose = useRef(null)
    const [note, setNote] = useState({eid:"", etitle: "", edescription: "", etag: "" });


    const updateNote=(currentNote)=>{
        ref.current.click();
        setNote({eid:currentNote._id, etitle:currentNote.title,edescription:currentNote.description,etag:currentNote.tag});
    }

    const onChange = (e) => {
        setNote({ ...note, [e.target.name]: e.target.value })
    }

    const handleClick = (e) => {
        editNote(note.eid,note.etitle,note.edescription,note.etag);
        refClose.current.click();
        e.preventDefault();
    }

    return (

        <>
            <AddNote />

            <button type="button" ref={ref}  className="btn btn-primary d-none" data-bs-toggle="modal" data-bs-target="#exampleModal">
                Launch demo modal
            </button>

            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Edit Note</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label htmlFor="title" className="form-label">Title</label>
                                <input type="text" className="form-control" name="etitle" value={note.etitle} onChange={onChange} id="etitle" aria-describedby="emailHelp" />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="description" className="form-label">Description</label>
                                <input type="text" className="form-control" name='edescription' value={note.edescription} onChange={onChange} id="edescription" aria-describedby="emailHelp" />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="tag" className="form-label">Tag</label>
                                <input type="text" className="form-control" id="etag" value={note.etag} onChange={onChange} name='etag' />
                            </div>

                        </div>
                        <div className="modal-footer">
                            <button type="button" ref={refClose} className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" onClick={handleClick}>Update changes</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row my-3">

                <h2>Your Notes</h2>
                <div className='container'>
                    {notes.length===0 && 'No Notes to Display'}
                </div>
                {notes.map((note) => {
                    return <Noteitem key={note._id} note={note} updateNote={updateNote} />;
                })}
            </div>
        </>

    )
}

export default Notes
