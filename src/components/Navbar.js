import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const Navbar = ({ showAlert }) => {
  const navigate = useNavigate();
  const loggedIn = Boolean(localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    showAlert('Logged out', 'info');
    navigate('/login');
  };

  return (
    <nav className="navbar sticky-top navbar-expand-md navbar-dark nb-navbar">
      <div className="container">
        <Link className="navbar-brand nb-brand" to="/">
          <img src={`${process.env.PUBLIC_URL}/favicon.svg`} alt="" width="28" height="28" />
          iNotebook
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-md-0">
            <li className="nav-item">
              <NavLink className="nav-link" end to="/">My notes</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/about">About</NavLink>
            </li>
          </ul>
          {!loggedIn ? (
            <div className="d-flex gap-2 pb-2 pb-md-0">
              <Link to="/login" className="btn btn-outline-light">Log in</Link>
              <Link to="/signup" className="btn btn-primary">Sign up</Link>
            </div>
          ) : (
            <button type="button" onClick={handleLogout} className="btn btn-outline-light mb-2 mb-md-0">
              <i className="bi bi-box-arrow-right me-1" aria-hidden="true"></i>Log out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
