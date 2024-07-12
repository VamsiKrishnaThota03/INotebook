import React, { useContext, useState } from 'react';
import noteContext from "../context/notes/noteContext"


const AddNote = () => {
  const context = useContext(noteContext);
  const {addNote} = context;

  const [note,setNote] = useState({title:"",description:"",tag:"default"});

  const onChange = (e)=>{
    setNote({...note,[e.target.name]:e.target.value})
  }

  const handleClick=(e)=>{
    e.preventDefault();
    addNote(note.title,note.description,note.tag);
  }

  return (
    <div>
      <div className="container my-3">
        <h2>Add Note</h2>
        <div className="container">
          <form>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Title</label>
              <input type="text" className="form-control" name="title" onChange={onChange} id="title" aria-describedby="emailHelp" />
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <input type="text" className="form-control" name='description' onChange={onChange} id="description" aria-describedby="emailHelp" />
            </div>
            <div className="mb-3">
              <label htmlFor="tag" className="form-label">Tag</label>
              <input type="text" className="form-control" id="tag" onChange={onChange} name='tag' />
            </div>

            <button type="submit" className="btn btn-primary" onClick={handleClick}>Submit</button>
          </form>
        </div>
      </div>


    </div>
  )
}

export default AddNote
