import React from 'react'
import {Link , useLocation, useNavigate} from 'react-router-dom';

const Navbar = () => {
    let location = useLocation();
    let history = useNavigate();
    // console.log(location);

    const handleLogout=()=>{
        localStorage.removeItem('token');
        history('/login');
    }

    return (
        <nav className="navbar fixed-top navbar-expand-lg navbar-dark bg-dark">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">Navbar</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className={`nav-link ${location.pathname==="/"?"active":""}`} aria-current="page" to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${location.pathname==="/about"?"active":""}`} to="/about">About</Link>
                        </li>
                        
                    </ul>
                    
                    {!localStorage.getItem('token')?<form className="d-flex mx-3" role="search">
                        <Link type="button" to='/login' className="btn btn-primary mx-3">Login</Link>
                        <Link type="button" to='/signup' className="btn btn-primary">Sign Up</Link>
                    </form>:<button onClick={handleLogout} className='btn btn-primary'>Logout</button>}
                </div>
            </div>
        </nav>
    )
}

export default Navbar
