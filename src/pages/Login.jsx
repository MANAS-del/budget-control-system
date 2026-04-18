import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'EMPLOYEE',
    department: 'IT',
    specialKey: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const doLogin = async () => {
    setError('');
    try {
      const res = await API.post('/auth/login', formData);
      
      const sessionData = {
        userId: res.data.userId,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role.toLowerCase(),
        department: res.data.department
      };

      localStorage.setItem('budget_user', JSON.stringify(sessionData));

      if (sessionData.role === 'admin') navigate('/admin');
      else if (sessionData.role === 'manager') navigate('/manager');
      else navigate('/employee');

    } catch (err) {
      setError(err.response?.data || 'Invalid credentials.');
    }
  };

  const needsKey = formData.role === 'ADMIN' || formData.role === 'MANAGER';

  return (
    <div id="login-page" style={{ paddingTop: '50px', paddingBottom: '50px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="login-box" style={{ marginTop: 0 }}>
        <div className="login-logo">Budget<span>Pro</span></div>
        <div className="login-sub">Sign in to your account</div>
        <div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" onKeyDown={(e) => e.key === 'Enter' && doLogin()} />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-input" name="role" value={formData.role} onChange={handleChange}>
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <select className="form-input" name="department" value={formData.department} onChange={handleChange}>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="FINANCE">Finance</option>
              <option value="OPERATIONS">Operations</option>
            </select>
          </div>
          {needsKey && (
            <div className="form-group">
              <label className="form-label">Special Key</label>
              <input className="form-input" name="specialKey" value={formData.specialKey} onChange={handleChange} placeholder="Company Special Key" onKeyDown={(e) => e.key === 'Enter' && doLogin()} />
            </div>
          )}
          
          <button className="btn btn-primary" onClick={doLogin} style={{ marginTop: '1rem' }}>Sign In</button>
          
          {error && <div className="error-msg">{error}</div>}
          
          <div style={{marginTop: '20px', textAlign: 'center'}}>
            <span style={{color: '#94a3b8', cursor: 'pointer', fontSize: '14px'}} onClick={() => navigate('/signup')}>Don't have an account? <span style={{color: '#60a5fa'}}>Sign up here</span></span>
          </div>
        </div>
      </div>
      <span className="back-link" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>← Back to home</span>
    </div>
  );
};

export default Login;
