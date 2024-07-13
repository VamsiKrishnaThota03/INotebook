// About.js

import React from 'react';

const About = () => {
  return (
    <div className="container mt-5">
      <h1 className="mb-4">About INotebook</h1>
      <p className="lead">
        Welcome to INotebook, your personal cloud-based note management application.
        INotebook is designed to help you keep all your notes organized and easily accessible from anywhere.
      </p>
      <h2 className="mt-5">Features</h2>
      <ul className="list-unstyled">
        <li className="my-2"><i className="bi bi-check-circle-fill text-success"></i> Create, edit, and delete notes</li>
        <li className="my-2"><i className="bi bi-check-circle-fill text-success"></i> Organize notes by categories</li>
        <li className="my-2"><i className="bi bi-check-circle-fill text-success"></i> Access your notes from any device</li>
        <li className="my-2"><i className="bi bi-check-circle-fill text-success"></i> Secure and private note storage</li>
      </ul>
      <h2 className="mt-5">Our Mission</h2>
      <p>
        Our mission is to provide a simple yet powerful tool for managing your notes. 
        Whether you are a student, professional, or just someone who likes to stay organized, 
        INotebook is here to help you keep track of your thoughts and ideas.
      </p>
      <h2 className="mt-5">Contact Us</h2>
      <p>
        If you have any questions or feedback, feel free to reach out to us at <a href="mailto:vamsikrishnathota483@gmail.com">vamsikrishnathota483@gmail.com</a>.
      </p>
    </div>
  );
};

export default About;
