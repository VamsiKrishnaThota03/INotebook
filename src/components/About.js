import React from 'react';

const FEATURES = [
  'Create, edit and delete notes',
  'Organise notes with tags and search them instantly',
  'Access your notes from any device after logging in',
  'Private: each account only sees its own notes',
];

const About = () => (
  <div className="nb-card p-4 p-md-5 mx-auto" style={{ maxWidth: 820 }}>
    <h1 className="fw-bold mb-3">About iNotebook</h1>
    <p className="lead text-body-secondary">
      iNotebook is a personal, cloud-based note app. Keep your notes organised and reachable from anywhere.
    </p>
    <h2 className="h4 fw-bold mt-4">Features</h2>
    <ul className="list-unstyled">
      {FEATURES.map((f) => (
        <li className="my-2" key={f}>
          <i className="bi bi-check-circle-fill text-success me-2" aria-hidden="true"></i>
          {f}
        </li>
      ))}
    </ul>
    <h2 className="h4 fw-bold mt-4">Our mission</h2>
    <p>
      A simple yet capable tool for managing your notes. Whether you are a student, a professional or just like to stay
      organised, iNotebook helps you keep track of your thoughts and ideas.
    </p>
    <h2 className="h4 fw-bold mt-4">Contact</h2>
    <p className="mb-0">
      Questions or feedback? Write to <a href="mailto:vamsikrishnathota483@gmail.com">vamsikrishnathota483@gmail.com</a>.
    </p>
  </div>
);

export default About;
