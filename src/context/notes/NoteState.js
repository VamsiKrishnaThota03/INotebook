import noteContext from './noteContext';
import { useState } from 'react';


const NoteState = (props) =>{

  const InitialNotes = [
    {
      "_id": "669105849bce8f333f58cef8",
      "user": "668d7775505b05e746945f5c",
      "title": "vamsi123",
      "description": "student of iiit college23",
      "tag": "yet to find out",
      "date": "2024-07-12T10:29:24.443Z",
      "__v": 0
    },
    {
      "_id": "6691249a24f1144484d9f32f",
      "user": "668d7775505b05e746945f5c",
      "title": "vamsi123",
      "description": "student of iiit college23",
      "tag": "yet to find out",
      "date": "2024-07-12T12:42:02.948Z",
      "__v": 0
    },
    {
      "_id": "6691249b24f1144484d9f331",
      "user": "668d7775505b05e746945f5c",
      "title": "vamsi123",
      "description": "student of iiit college23",
      "tag": "yet to find out",
      "date": "2024-07-12T12:42:03.539Z",
      "__v": 0
    },
    {
      "_id": "669124a224f1144484d9f333",
      "user": "668d7775505b05e746945f5c",
      "title": "krishna",
      "description": "student of iiit college23",
      "tag": "yet to find out",
      "date": "2024-07-12T12:42:10.014Z",
      "__v": 0
    }
  ]

  const [notes,setNotes] = useState(InitialNotes);


  // add a note
  const addNote=(title,description,tag)=>{
    console.log("Adding a new Note");
    const note={
      "_id": "669124a12387224f1144484d9f33312",
      "user": "668d7775505b05e746945f5c",
      "title": title,
      "description": description,
      "tag": tag,
      "date": "2024-07-12T12:42:10.014Z",
      "__v": 0
    }
    setNotes(notes.concat(note));
  }


  // delete a note
  const deleteNote=(id)=>{
    console.log("deleting the node");
    const newNotes = notes.filter((note)=>{return note._id!==id});
    setNotes(newNotes);
  }


  // edit a note
  const editNote=()=>{

  }


  return(
    <noteContext.Provider value={{notes,addNote,deleteNote,editNote}}>
      { props.children }
    </noteContext.Provider>
  )

}

export default NoteState;