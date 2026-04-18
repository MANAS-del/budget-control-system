import React, { useState, useEffect } from 'react';
import API from '../api';
import Sidebar from '../components/Sidebar';
import API_BASE_URL from '../config';

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const pct = (spent, total) => { if (!total) return 0; return Math.min(100, Math.round((spent / total) * 100)); };
const pctColor = (p) => { if (p >= 90) return 'progress-red'; if (p >= 70) return 'progress-amber'; return 'progress-green'; };
const pctTextColor = (p) => { if (p >= 90) return 'stat-red'; if (p >= 70) return 'stat-amber'; return 'stat-green'; };
const getStatusBadge = (s) => {
  const map = { PENDING: 'badge-pending', APPROVED: 'badge-approved', REJECTED: 'badge-rejected', ESCALATED: 'badge-manager' };
  const icons = { PENDING: '◔', APPROVED: '✓', REJECTED: '✕', ESCALATED: '↑' };
  const str = s ? s.toUpperCase() : 'PENDING';
  return <span className={`badge ${map[str] || 'badge-pending'}`}>{icons[str] || ''}{str}</span>;
};

const ManagerDashboard = () => {
  const [currentTab, setCurrentTab] = useState('overview');
  const [requests, setRequests] = useState([]);
  const [budgetData, setBudgetData] = useState({ totalBudget: 0, usedBudget: 0, remainingBudget: 0 });
  
  const userString = localStorage.getItem('budget_user');
  const currentUser = userString ? JSON.parse(userString) : {};

  const fetchBudget = async () => {
    try {
      const { data } = await API.get('/manager/my-budget');
      if (data) {
        setBudgetData({
           totalBudget: data.totalBudget || 0,
           usedBudget: data.usedBudget || 0,
           remainingBudget: (data.totalBudget || 0) - (data.usedBudget || 0)
        });
      }
    } catch (err) {
      console.error("No budget assigned yet", err);
    }
  };

  const fetchRequests = async () => {
    try {
      const { data } = await API.get('/manager/requests');
      setRequests(data.reverse());
    } catch (err) {
      console.error("Failed fetching requests", err);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchBudget();
  }, [currentTab]);

  const handleAction = async (id, actionType) => {
    try {
      await API.post('/manager/action', { requestId: id, action: actionType });
      fetchRequests();
      fetchBudget();
    } catch (err) {
      alert(`Action Failed: ${err.response?.data || err.message}`);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: '◈' },
    { id: 'pending', label: 'Pending Review', icon: '◔' },
    { id: 'history', label: 'Request History', icon: '⊟' }
  ];

  const renderRecentTable = (reqs, withActions = false) => {
    if (!reqs.length) return <div className="empty"><div className="empty-icon">📭</div><div className="empty-text">No requests to show</div></div>;
    return (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Employee</th><th>Amount</th><th>Purpose</th><th>Date</th><th>Attachment</th><th>Status</th>
              {withActions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {reqs.map(r => (
              <tr key={r.id}>
                <td className="mono" style={{ color: 'var(--text3)', fontSize: '.7rem' }}>{r.id}</td>
                <td style={{ fontWeight: 500, color: 'var(--text)' }}>{r.employeeId}</td>
                <td style={{ fontWeight: 600, color: 'var(--accent2)' }}>{fmt(r.amount)}</td>
                <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.purpose}</td>
                <td className="mono" style={{ fontSize: '.7rem' }}>{fmtDate(r.createdAt)}</td>
                <td>{r.attachmentPath ? <a href={`${API_BASE_URL}${r.attachmentPath}`} target="_blank" rel="noopener noreferrer">View</a> : '—'}</td>
                <td>{getStatusBadge(r.status)}</td>
                {withActions && (
                  <td>
                    <div className="action-row">
                      { r.amount <= budgetData.remainingBudget ? (
                         <>
                           <button className="btn btn-success btn-sm" onClick={() => handleAction(r.id, 'APPROVE')}>✓ Approve</button>
                           <button className="btn btn-danger btn-sm" onClick={() => handleAction(r.id, 'REJECT')}>✕ Reject</button>
                         </>
                      ) : (
                         <button className="btn btn-primary btn-sm" style={{ background: '#eab308', borderColor: '#ca8a04', color: '#fff' }} onClick={() => handleAction(r.id, 'ESCALATE')}>↑ Escalate</button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderOverview = () => {
    const pendingReqs = requests.filter(r => r.status === 'PENDING');
    const p = pct(budgetData.usedBudget, budgetData.totalBudget);
    
    return (
      <>
        <div className="page-header">
          <h1 className="page-title">Manager Dashboard</h1>
          <p className="page-subtitle">{currentUser.userId} Budget Overview</p>
        </div>
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-label">Allocated Budget</div><div className="stat-value stat-accent">{fmt(budgetData.totalBudget)}</div><div className="stat-sub">From Admin</div></div>
          <div className="stat-card"><div className="stat-label">Spent</div><div className="stat-value" className={pctTextColor(p)}>{fmt(budgetData.usedBudget)}</div><div className="stat-sub">{p}% used</div></div>
          <div className="stat-card"><div className="stat-label">Remaining</div><div className="stat-value stat-green">{fmt(budgetData.remainingBudget)}</div><div className="stat-sub">Available</div></div>
          <div className="stat-card"><div className="stat-label">Pending Review</div><div className="stat-value stat-amber">{pendingReqs.length}</div><div className="stat-sub">Awaiting your action</div></div>
        </div>
        
        {budgetData.totalBudget === 0 && (
           <div className="alert alert-warning" style={{marginBottom: '1rem'}}>
              You currently have no budget allocated. All requests will need to be Escalated until an Admin assigns you a budget.
           </div>
        )}

        {pendingReqs.length > 0 && (
          <div className="section">
            <div className="section-header">
              <div className="section-title">Needs Your Attention</div>
              <div><button className="btn btn-ghost btn-sm" onClick={() => setCurrentTab('pending')}>View all →</button></div>
            </div>
            {renderRecentTable(pendingReqs.slice(0, 5), true)}
          </div>
        )}
        <div className="section">
          <div className="section-header"><div className="section-title">Budget Health</div></div>
          <div className="dept-row">
            <div className="dept-name">Available Funds</div>
            <div className="dept-meta mono">{fmt(budgetData.usedBudget)} / {fmt(budgetData.totalBudget)}</div>
            <div className="dept-bar-wrap"><div className="progress-wrap"><div className={`progress-bar ${pctColor(p)}`} style={{ width: `${p}%` }}></div></div></div>
            <div className={`dept-meta mono ${pctTextColor(p)}`}>{p}%</div>
          </div>
        </div>
      </>
    );
  };

  const renderPending = () => {
    const pending = requests.filter(r => r.status === 'PENDING');
    return (
      <>
        <div className="page-header">
          <h1 className="page-title">Pending Review</h1>
          <p className="page-subtitle">{pending.length} request{pending.length !== 1 ? 's' : ''} awaiting your decision</p>
        </div>
        <div id="pending-list">
          {!pending.length ? (
            <div className="section"><div className="empty"><div className="empty-icon">✅</div><div className="empty-text">All caught up! No pending requests.</div></div></div>
          ) : (
            pending.map(r => {
              const exceeds = r.amount > budgetData.remainingBudget;
              return (
                <div className="section" key={r.id}>
                  <div className="section-header">
                    <div>
                      <div className="section-title">{r.purpose} {r.attachmentPath && <a href={`${API_BASE_URL}${r.attachmentPath}`} target="_blank" rel="noopener noreferrer" style={{fontSize:'.8rem', marginLeft:'10px', color:'var(--blue)'}}>📎 View Attachment</a>}</div>
                      <div className="section-sub">{r.employeeId} • {r.department} • {fmtDate(r.createdAt)}</div>
                    </div>
                    {getStatusBadge(r.status)}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div className="stat-card"><div className="stat-label">Requested</div><div className={`stat-value ${exceeds ? 'stat-red' : 'stat-accent'}`} style={{ fontSize: '1.25rem' }}>{fmt(r.amount)}</div></div>
                    <div className="stat-card"><div className="stat-label">Employee ID</div><div className="stat-value" style={{ fontSize: '1rem', fontFamily: 'DM Mono' }}>{r.employeeId}</div></div>
                    <div className="stat-card"><div className="stat-label">Category</div><div className="stat-value" style={{ fontSize: '1rem' }}>{r.category || 'General'}</div></div>
                  </div>
                  {r.description && (
                    <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '1rem', marginBottom: '1.25rem', color: 'var(--text2)', fontSize: '.875rem', lineHeight: '1.6' }}>
                      <strong style={{ color: 'var(--text3)', fontSize: '.7rem', fontFamily: 'DM Mono', display: 'block', marginBottom: '.4rem', textTransform: 'uppercase' }}>Description</strong>{r.description}
                    </div>
                  )}
                  <div className="action-row">
                    {exceeds ? (
                       <button className="btn btn-primary" style={{ width: '100%', background: '#eab308', borderColor: '#ca8a04', color: '#fff' }} onClick={() => handleAction(r.id, 'ESCALATE')}>
                          ⚠️ Insufficient Budget (Only {fmt(budgetData.remainingBudget)} left). Click to ESCALATE to Admin.
                       </button>
                    ) : (
                       <>
                         <button className="btn btn-success" onClick={() => handleAction(r.id, 'APPROVE')}>✓ Approve Request</button>
                         <button className="btn btn-danger" onClick={() => handleAction(r.id, 'REJECT')}>✕ Reject Request</button>
                       </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </>
    );
  };

  const renderHistory = () => (
    <>
      <div className="page-header">
        <h1 className="page-title">Request History</h1>
        <p className="page-subtitle">Your handled requests</p>
      </div>
      <div className="section">
        {requests.length ? renderRecentTable(requests) : <div className="empty"><div className="empty-icon">📋</div><div className="empty-text">No requests handled yet.</div></div>}
      </div>
    </>
  );

  return (
    <div id="dashboard">
      <Sidebar currentTab={currentTab} navItems={navItems} navigateTo={setCurrentTab} />
      <div className="main-content" id="main-content">
        {currentTab === 'overview' && renderOverview()}
        {currentTab === 'pending' && renderPending()}
        {currentTab === 'history' && renderHistory()}
      </div>
    </div>
  );
};

export default ManagerDashboard;
