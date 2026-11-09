import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from './AuthCard';
import { apiRequest } from '../api';

const Login = ({ showAlert }) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const json = await apiRequest('/auth/login', { method: 'POST', body: credentials });
      localStorage.setItem('token', json.authtoken);
      showAlert('Logged in successfully');
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
    setSubmitting(false);
  };

  return (
    <AuthCard title="Log in" subtitle="Welcome back. Your notes are waiting.">
      <form onSubmit={handleSubmit}>
        {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
        <div className="mb-3">
          <label htmlFor="email" className="form-label fw-semibold">Email address</label>
          <input type="email" className="form-control" name="email" id="email" autoComplete="email" required value={credentials.email} onChange={handleChange} />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="form-label fw-semibold">Password</label>
          <input type="password" className="form-control" name="password" id="password" autoComplete="current-password" required value={credentials.password} onChange={handleChange} />
        </div>
        <button type="submit" className="btn btn-primary w-100 mb-3" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
        <p className="text-center small text-body-secondary mb-0">
          No account yet? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </AuthCard>
  );
};

export default Login;
