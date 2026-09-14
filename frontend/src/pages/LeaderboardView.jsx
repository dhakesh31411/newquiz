import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Search, RefreshCw, Award } from 'lucide-react';
import LogoHeader from '../components/LogoHeader';
import BackHeader from '../components/BackHeader';

export default function LeaderboardView({ logoUrl, websiteName = 'QuizMaster', onBack }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (res.ok && data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (err) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const filteredList = leaderboard.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      {onBack && (
        <BackHeader label="Back to User Portal" onBack={onBack} />
      )}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '28px' }}>
        {/* Header */}
        <LogoHeader 
          title={`${websiteName} Leaderboard`} 
          subtitle="Rankings automatically updated upon quiz completion. Ranked by Score, tie-broken by fastest completion time."
          logoUrl={logoUrl}
        />

        {/* Search & Refresh Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search user name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 42px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <button onClick={fetchLeaderboard} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Rankings
          </button>
        </div>

        {/* Leaderboard Table */}
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px' }}>Rank</th>
                <th style={{ padding: '12px 16px' }}>Student Name</th>
                <th style={{ padding: '12px 16px' }}>Score</th>
                <th style={{ padding: '12px 16px' }}>Time Spent</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading leaderboard rankings...</td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No quiz attempts recorded yet. Be the first to take the quiz!</td>
                </tr>
              ) : (
                filteredList.map((row) => (
                  <tr key={row.rank} style={{ 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    background: row.rank === 1 ? 'rgba(245, 158, 11, 0.08)' : row.rank === 2 ? 'rgba(148, 163, 184, 0.08)' : row.rank === 3 ? 'rgba(180, 83, 9, 0.08)' : 'transparent'
                  }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                      {row.rank === 1 && '🥇 #1'}
                      {row.rank === 2 && '🥈 #2'}
                      {row.rank === 3 && '🥉 #3'}
                      {row.rank > 3 && `#${row.rank}`}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>{row.name}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                      {row.score} / {row.total_questions}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {formatTime(row.time_spent_seconds)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
