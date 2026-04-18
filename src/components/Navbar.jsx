import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('budget_user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('budget_user');
    navigate('/login');
  };

  return (
    <nav style={{
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          backgroundColor: 'var(--accent-blue)',
          padding: '8px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <User size={20} color="white" />
        </div>
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Budget System</h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ textAlign: 'right' }}>
          <span style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-light)' }}>
            {user.email || user.userId}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
            {user.role} {user.department ? `(${user.department})` : ''}
          </span>
        </div>
        
        <button 
          onClick={handleLogout}
          style={{
            background: 'none',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            padding: '8px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = 'var(--text-light)'; e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
          onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
