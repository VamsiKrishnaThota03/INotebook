import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';


const Signup = () => {
    let history = useNavigate();

    const [credentials, setCredentials] = useState({ name: "", email: "", password: "" });

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    }

    const handleSubmit=async(e)=>{
        e.preventDefault();
        const response = await fetch("http://localhost:5000/api/auth/createuser", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json'
            },
            body : JSON.stringify({name:credentials.name,email:credentials.email,password:credentials.password})
        });
        const json = await response.json();
        console.log(json);
        if(json.success)
        {
            localStorage.setItem('token',json.authtoken);
            history("/");
        }
        else
        {
            alert("User Already Exists");
        }
    }

    return (
        <div>
            <div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="exampleInputEmail1" className="form-label">Name</label>
                        <input type="text" className="form-control" name='name' onChange={handleChange} id="name" aria-describedby="emailHelp" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
                        <input type="email" className="form-control" name='email' onChange={handleChange} id="email" aria-describedby="emailHelp" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                        <input type="password" className="form-control" name='password' onChange={handleChange} id="password" />
                    </div>

                    <button type="submit" className="btn btn-primary">Submit</button>
                </form>
            </div>
        </div>
    )
}

export default Signup
