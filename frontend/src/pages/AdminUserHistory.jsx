import React, { useState, useEffect } from 'react';
import { Search, UserCheck, Calendar, Trophy, Clock, CheckCircle2, History, ArrowLeft } from 'lucide-react';

export default function AdminUserHistory({ adminSession }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userHistory, setUserHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}`, {
        headers: { 'Authorization': `Bearer ${adminSession.token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.users);
      }
    } catch (err) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleInspectUser = async (user) => {
    setSelectedUser(user);
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/history`, {
        headers: { 'Authorization': `Bearer ${adminSession.token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserHistory(data);
      }
    } catch (err) {}
    finally {
      setLoadingHistory(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {selectedUser ? (
        /* Detailed User Inspection View */
        <div className="glass-panel" style={{ padding: '32px' }}>
          <button onClick={() => { setSelectedUser(null); setUserHistory(null); }} className="btn btn-secondary" style={{ marginBottom: '20px', fontSize: '0.85rem' }}>
            <ArrowLeft size={16} /> Back to User Search
          </button>

          {/* User Info Header Card */}
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '28px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '4px' }}>{selectedUser.name}</h3>
            <p style={{ color: 'var(--accent-cyan)', fontFamily: 'monospace', fontSize: '0.95rem', marginBottom: '16px' }}>Phone: {selectedUser.phone}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Total Attempts</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{userHistory?.attempts.length || 0}</div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Best Score</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  {Math.max(0, ...(userHistory?.attempts || []).map(a => a.score))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Leaderboard Attempts</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                  {(userHistory?.attempts || []).filter(a => a.is_first_attempt).length}
                </div>
              </div>
            </div>
          </div>

          {/* Complete Attempt History Table */}
          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={20} color="var(--accent-primary)" /> Complete Quiz Attempt History
          </h4>

          {loadingHistory ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading attempt history...</p>
          ) : userHistory?.attempts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No quiz attempts recorded for this user.</p>
          ) : (
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px' }}>Quiz Title</th>
                    <th style={{ padding: '12px' }}>Attempt #</th>
                    <th style={{ padding: '12px' }}>Score</th>
                    <th style={{ padding: '12px' }}>Percentage</th>
                    <th style={{ padding: '12px' }}>Time Taken</th>
                    <th style={{ padding: '12px' }}>Completed Date</th>
                    <th style={{ padding: '12px' }}>Leaderboard Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userHistory.attempts.map(att => (
                    <tr key={att.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{att.quiz_title}</td>
                      <td style={{ padding: '12px' }}>Attempt #{att.attempt_number}</td>
                      <td style={{ padding: '12px', fontWeight: 700, color: 'var(--accent-emerald)' }}>{att.score} / {att.total_questions}</td>
                      <td style={{ padding: '12px' }}>{att.percentage}%</td>
                      <td style={{ padding: '12px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{formatTime(att.time_spent_seconds)}</td>
                      <td style={{ padding: '12px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>{new Date(att.completed_at).toLocaleDateString()}</td>
                      <td style={{ padding: '12px' }}>
                        {att.leaderboard_status === 'Final Score' ? (
                          <span className="badge badge-success">🏆 Final Score</span>
                        ) : (
                          <span className="badge badge-indigo">Practice</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* User Directory Search List */
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Admin User History Directory</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Search users by Name or Phone number to inspect their full quiz history.</p>
            </div>

            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search Name or Phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 14px 10px 40px', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px' }}>User ID</th>
                  <th style={{ padding: '12px' }}>Name</th>
                  <th style={{ padding: '12px' }}>Phone Number</th>
                  <th style={{ padding: '12px' }}>Total Attempts</th>
                  <th style={{ padding: '12px' }}>Best Score</th>
                  <th style={{ padding: '12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Searching user records...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No registered users found.</td></tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '14px', color: 'var(--text-dim)' }}>#{u.id}</td>
                      <td style={{ padding: '14px', fontWeight: 600 }}>{u.name}</td>
                      <td style={{ padding: '14px', color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>{u.phone}</td>
                      <td style={{ padding: '14px' }}>{u.total_attempts || 0}</td>
                      <td style={{ padding: '14px', color: 'var(--accent-emerald)', fontWeight: 700 }}>{u.best_score || 0}</td>
                      <td style={{ padding: '14px' }}>
                        <button onClick={() => handleInspectUser(u)} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                          Inspect History
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
