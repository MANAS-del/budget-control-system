import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div id="landing">
      <div className="eyebrow">✦ Financial Intelligence Platform</div>
      <h1 className="landing-title">Budget<span className="accent">Pro</span></h1>
      <p className="landing-sub">A modern budget control system. Allocate funds, track expenses, and manage approvals — all in one place.</p>
      
      <div className="landing-cards">
        <div className="role-card" onClick={() => navigate('/login')}>
          <div className="role-icon">👤</div>
          <div className="role-name">Employee</div>
          <div className="role-desc">Submit fund requests and track approval status in real time.</div>
          <span className="demo-badge">Portal →</span>
        </div>
        <div className="role-card" onClick={() => navigate('/login')}>
          <div className="role-icon">👨‍💼</div>
          <div className="role-name">Manager</div>
          <div className="role-desc">Review, approve or reject department budget requests.</div>
          <span className="demo-badge">Portal →</span>
        </div>
        <div className="role-card" onClick={() => navigate('/login')}>
          <div className="role-icon">⚙️</div>
          <div className="role-name">Admin</div>
          <div className="role-desc">Manage users, allocate budgets, and oversee all activity.</div>
          <span className="demo-badge">Portal →</span>
        </div>
      </div>

      <div className="feature-strip">
        <div className="feature-item"><span className="feature-dot"></span>Role-based access</div>
        <div className="feature-item"><span className="feature-dot"></span>Approval workflows</div>
        <div className="feature-item"><span className="feature-dot"></span>Budget tracking</div>
        <div className="feature-item"><span className="feature-dot"></span>Persistent data</div>
      </div>
    </div>
  );
};

export default Landing;
