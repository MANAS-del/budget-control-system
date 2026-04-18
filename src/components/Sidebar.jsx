import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ currentTab, navItems, navigateTo }) => {
  const navigate = useNavigate();
  const userString = localStorage.getItem('budget_user');
  const user = userString ? JSON.parse(userString) : { name: '—', role: '—' };
  
  const getInitials = (name) => {
    if (!name || name === '—') return '?';
    return name.split(' ').map(x=>x[0]).join('').toUpperCase().slice(0,2);
  };

  const handleLogout = () => {
    localStorage.removeItem('budget_user');
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">Budget<span>Pro</span></div>
      
      <div className="user-badge">
        <div className="user-avatar" id="user-avatar-initials">
          {getInitials(user.name || user.userId)}
        </div>
        <div className="user-name">{user.name || user.userId}</div>
        <div className="user-role">{user.role}</div>
      </div>

      <div id="nav-menu">
        <div className="nav-section">Navigation</div>
        {navItems.map((item) => (
          <div 
            key={item.id}
            className={`nav-item ${currentTab === item.id ? 'active' : ''}`}
            onClick={() => navigateTo(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>{item.label}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
      </div>
    </div>
  );
};

export default Sidebar;
