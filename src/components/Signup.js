import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from './AuthCard';
import { apiRequest } from '../api';

const Signup = ({ showAlert }) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ name: '', email: '', password: '', cpassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (credentials.password !== credentials.cpassword) {
      setError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      const { name, email, password } = credentials;
      const json = await apiRequest('/auth/createuser', { method: 'POST', body: { name, email, password } });
      localStorage.setItem('token', json.authtoken);
      showAlert('Account created');
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
    setSubmitting(false);
  };

  return (
    <AuthCard title="Create your account" subtitle="Keep your notes safe and reachable from any device.">
      <form onSubmit={handleSubmit}>
        {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
        <div className="mb-3">
          <label htmlFor="name" className="form-label fw-semibold">Name</label>
          <input type="text" className="form-control" name="name" id="name" autoComplete="name" required minLength={3} value={credentials.name} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label fw-semibold">Email address</label>
          <input type="email" className="form-control" name="email" id="email" autoComplete="email" required value={credentials.email} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label fw-semibold">Password</label>
          <input type="password" className="form-control" name="password" id="password" autoComplete="new-password" required minLength={5} aria-describedby="passwordHelp" value={credentials.password} onChange={handleChange} />
          <div id="passwordHelp" className="form-text">At least 5 characters.</div>
        </div>
        <div className="mb-4">
          <label htmlFor="cpassword" className="form-label fw-semibold">Confirm password</label>
          <input type="password" className="form-control" name="cpassword" id="cpassword" autoComplete="new-password" required minLength={5} value={credentials.cpassword} onChange={handleChange} />
        </div>
        <button type="submit" className="btn btn-primary w-100 mb-3" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Sign up'}
        </button>
        <p className="text-center small text-body-secondary mb-0">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </AuthCard>
  );
};

export default Signup;
