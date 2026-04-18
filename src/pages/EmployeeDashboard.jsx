import React, { useState, useEffect } from 'react';
import API from '../api';
import Sidebar from '../components/Sidebar';
import API_BASE_URL from '../config';

// Utilities
const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const getStatusBadge = (s) => {
  const map = { PENDING: 'badge-pending', APPROVED: 'badge-approved', REJECTED: 'badge-rejected', ESCALATED: 'badge-manager' };
  const icons = { PENDING: '◔', APPROVED: '✓', REJECTED: '✕', ESCALATED: '↑' };
  const str = s ? s.toUpperCase() : 'PENDING';
  return <span className={`badge ${map[str] || 'badge-pending'}`}>{icons[str] || ''}{str}</span>;
};

const EmployeeDashboard = () => {
  const [currentTab, setCurrentTab] = useState('overview');
  const [requests, setRequests] = useState([]);
  const [alert, setAlert] = useState(null);

  // New Request Form State
  const [formData, setFormData] = useState({ purpose: '', amount: '', category: 'Equipment', description: '', file: null });
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // For resetting file input

  const userString = localStorage.getItem('budget_user');
  const currentUser = userString ? JSON.parse(userString) : {};

  const fetchRequests = async () => {
    try {
      const { data } = await API.get('/employee/my-requests');
      setRequests(data.reverse());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentTab]);

  const showAlert = (msg, type) => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: '◈' },
    { id: 'newrequest', label: 'New Request', icon: '＋' },
    { id: 'myrequests', label: 'My Requests', icon: '⊞' }
  ];

  const submitRequest = async () => {
    if (!formData.purpose) return showAlert('Enter a purpose for your request.', 'error');
    if (!formData.amount || formData.amount <= 0) return showAlert('Enter a valid amount greater than 0.', 'error');

    const payload = new FormData();
    payload.append('purpose', formData.purpose);
    payload.append('category', formData.category);
    payload.append('amount', formData.amount);
    payload.append('description', formData.description);
    if (formData.file) {
      payload.append('file', formData.file);
    }

    try {
      const res = await API.post('/employee/request', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showAlert(`✓ ${res.data}`, 'success');
      setFormData({ purpose: '', amount: '', category: 'Equipment', description: '', file: null });
      setFileInputKey(Date.now());
      fetchRequests();
    } catch (err) {
      showAlert('Failed to submit: ' + (err.response?.data || err.message), 'error');
    }
  };

  const renderRecentTable = (reqs) => {
    if (!reqs.length) return <div className="empty"><div className="empty-icon">📭</div><div className="empty-text">No requests to show</div></div>;
    return (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Manager</th><th>Department</th><th>Amount</th><th>Purpose</th><th>Date</th><th>Attachment</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reqs.map(r => (
              <tr key={r.id}>
                <td className="mono" style={{ color: 'var(--text3)', fontSize: '.7rem' }}>{r.id}</td>
                <td style={{ fontWeight: 500, color: 'var(--text)' }}>{r.managerId || 'System'}</td>
                <td>{r.department}</td>
                <td style={{ fontWeight: 600, color: 'var(--accent2)' }}>{fmt(r.amount)}</td>
                <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.purpose}</td>
                <td className="mono" style={{ fontSize: '.7rem' }}>{fmtDate(r.createdAt)}</td>
                <td>{r.attachmentPath ? <a href={`${API_BASE_URL}${r.attachmentPath}`} target="_blank" rel="noopener noreferrer">View File</a> : '—'}</td>
                <td>{getStatusBadge(r.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderOverview = () => {
    const pending = requests.filter(r => r.status === 'PENDING').length;
    const approved = requests.filter(r => r.status === 'APPROVED');
    const totalApproved = approved.reduce((s, r) => s + r.amount, 0);

    return (
      <>
        <div className="page-header">
          <h1 className="page-title">My Dashboard</h1>
          <p className="page-subtitle">{currentUser.department} • {currentUser.userId}</p>
        </div>
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-label">My Requests</div><div className="stat-value stat-accent">{requests.length}</div><div className="stat-sub">Total submitted</div></div>
          <div className="stat-card"><div className="stat-label">Pending</div><div className="stat-value stat-amber">{pending}</div><div className="stat-sub">Awaiting review</div></div>
          <div className="stat-card"><div className="stat-label">Approved</div><div className="stat-value stat-green">{approved.length}</div><div className="stat-sub">{fmt(totalApproved)} total</div></div>
          <div className="stat-card"><div className="stat-label">Rejected</div><div className="stat-value stat-red">{requests.filter(r => r.status === 'REJECTED').length}</div><div className="stat-sub">Not approved</div></div>
        </div>
        <div className="section">
          <div className="section-header">
            <div className="section-title">Recent Activity</div>
            <button className="btn btn-primary btn-sm" onClick={() => setCurrentTab('newrequest')}>+ New Request</button>
          </div>
          {requests.length ? renderRecentTable(requests.slice(0, 6)) : <div className="empty"><div className="empty-icon">📋</div><div className="empty-text">No requests yet. Submit your first one!</div></div>}
        </div>
      </>
    );
  };

  const renderNewRequest = () => (
    <>
      <div className="page-header">
        <h1 className="page-title">New Fund Request</h1>
        <p className="page-subtitle">Submit a request for budget approval</p>
      </div>
      <div className="section" style={{ maxWidth: '560px' }}>
        {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
        <div className="form-group">
          <label className="form-label">Request Purpose</label>
          <input className="form-input" placeholder="e.g. New laptops for dev team" value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
            <input className="form-input" type="number" placeholder="25000" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
              <option>Equipment</option><option>Travel</option><option>Training</option><option>Software</option><option>Marketing</option><option>Operations</option><option>Other</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Attachment (Bill / Document)</label>
          <input key={fileInputKey} className="form-input" type="file" onChange={e => setFormData({ ...formData, file: e.target.files[0] })} />
        </div>
        <div className="form-group">
          <label className="form-label">Description (optional)</label>
          <textarea className="form-input" placeholder="Additional details about this request..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
        </div>
        <div className="alert alert-info">Your request will go to your assigned department manager for review.</div>
        <button className="btn btn-primary" onClick={submitRequest} style={{ width: '100%', marginTop: '.5rem' }}>Submit Request →</button>
      </div>
    </>
  );

  const renderMyRequests = () => (
    <>
      <div className="page-header">
        <h1 className="page-title">My Requests</h1>
        <p className="page-subtitle">All fund requests submitted by you</p>
      </div>
      <div className="section">
        <div className="section-header">
          <div className="section-title">Request History ({requests.length})</div>
          <button className="btn btn-primary btn-sm" onClick={() => setCurrentTab('newrequest')}>+ New Request</button>
        </div>
        {!requests.length ? <div className="empty"><div className="empty-icon">📋</div><div className="empty-text">You haven't submitted any requests yet.</div></div> : renderRecentTable(requests)}
      </div>
    </>
  );

  return (
    <div id="dashboard">
      <Sidebar currentTab={currentTab} navItems={navItems} navigateTo={setCurrentTab} />
      <div className="main-content" id="main-content">
        {currentTab === 'overview' && renderOverview()}
        {currentTab === 'newrequest' && renderNewRequest()}
        {currentTab === 'myrequests' && renderMyRequests()}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
