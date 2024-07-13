import noteContext from './noteContext';
import { useState } from 'react';


const NoteState = (props) =>{

  const host = "http://localhost:5000"

  const InitialNotes = []

  const [notes,setNotes] = useState(InitialNotes);

  // fetching notes
  const getNote=async()=>{
    const response = await fetch(`${host}/api/notes/fetchnotes`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        "auth-token": localStorage.getItem('token')
      },
    });
    const json = await response.json();
    console.log(json);
    setNotes(json);
  }

  // add a note
  const addNote=async(title,description,tag)=>{
    const response = await fetch(`${host}/api/notes/createnote`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        "auth-token": localStorage.getItem('token')
      },
      body: JSON.stringify({title,description,tag}),
    });
    console.log("Adding a new Note");
    const json = await response.json();
    setNotes(notes.concat(json));
    console.log(json)
  }


  // delete a note
  const deleteNote=async(id)=>{
    const response = await fetch(`${host}/api/notes/deletenote/${id}`, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
        "auth-token": localStorage.getItem('token')
      },
    });
    const json = await response.json();
    console.log(json);
    const newNotes = notes.filter((note) => note._id !== id);
    setNotes(newNotes);
  }


  // edit a note
  const editNote=async(id,title,description,tag)=>{
    const response = await fetch(`${host}/api/notes/updatenote/${id}`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
        "auth-token": localStorage.getItem('token')
      },
      body: JSON.stringify({title,description,tag}),
    });

    let newNotes = JSON.parse(JSON.stringify(notes));

    for(let index =0;index<newNotes.length;++index)
    {
      const element = newNotes[index];
      if(element._id===id)
      {
        newNotes[index].title = title;
        newNotes[index].description = description;
        newNotes[index] = tag;
        break;
      }
    }
    setNotes(notes);
  }


  return(
    <noteContext.Provider value={{notes,addNote,deleteNote,editNote, getNote}}>
      { props.children }
    </noteContext.Provider>
  )

}

export default NoteState;