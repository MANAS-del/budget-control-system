import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    department: 'IT',
    specialKey: ''
  });
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const doSignup = async () => {
    setError('');
    setMsg('');
    try {
      await API.post('/auth/signup', formData);
      setMsg('User registered successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data || 'An error occurred during signup.');
    }
  };

  const needsKey = formData.role === 'ADMIN' || formData.role === 'MANAGER';

  return (
    <div id="login-page" style={{ paddingTop: '50px', paddingBottom: '50px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="login-box" style={{ marginTop: 0 }}>
        <div className="login-logo">Budget<span>Pro</span></div>
        <div className="login-sub">Create a new account</div>
        
        <div className="form-group">
          <label className="form-label">Name</label>
          <input className="form-input" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" name="email" value={formData.email} onChange={handleChange} placeholder="Email address" />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" />
        </div>
        <div className="form-group">
          <label className="form-label">Role</label>
          <select className="form-input" name="role" value={formData.role} onChange={handleChange}>
            <option value="EMPLOYEE">Employee</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        {formData.role !== 'ADMIN' && formData.role !== 'admin' && (
          <div className="form-group">
            <label className="form-label">Department</label>
            <select className="form-input" name="department" value={formData.department} onChange={handleChange}>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="FINANCE">Finance</option>
              <option value="OPERATIONS">Operations</option>
            </select>
          </div>
        )}
        {needsKey && (
          <div className="form-group">
            <label className="form-label">Special Key</label>
            <input className="form-input" name="specialKey" value={formData.specialKey} onChange={handleChange} placeholder="Company Special Key" />
          </div>
        )}
        
        <button className="btn btn-primary" onClick={doSignup} style={{ marginTop: '1rem' }}>Sign Up</button>
        {error && <div className="error-msg">{error}</div>}
        {msg && <div style={{color: '#4ade80', marginTop: '10px', fontSize: '14px', textAlign: 'center'}}>{msg}</div>}
        
        <div style={{marginTop: '20px', textAlign: 'center'}}>
          <span style={{color: '#94a3b8', cursor: 'pointer', fontSize: '14px'}} onClick={() => navigate('/login')}>Already have an account? <span style={{color: '#60a5fa'}}>Login here</span></span>
        </div>
      </div>
      <span className="back-link" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>← Back to home</span>
    </div>
  );
};

export default Signup;
