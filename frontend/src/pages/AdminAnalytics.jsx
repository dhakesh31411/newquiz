import React, { useState, useEffect } from 'react';
import { BarChart3, Users, HelpCircle, Trophy, Download, Activity, CheckCircle } from 'lucide-react';

export default function AdminAnalytics({ adminSession }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/admin/analytics', {
          headers: { 'Authorization': `Bearer ${adminSession.token}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setAnalytics(data.analytics);
        }
      } catch (err) {}
      finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [adminSession]);

  const handleExportCSV = () => {
    window.open('/api/admin/export/csv', '_blank');
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '32px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading analytics data...</p>
      </div>
    );
  }

  const data = analytics || { totalUsers: 0, totalQuizzes: 0, totalQuestions: 0, totalAttempts: 0, activeQuizzes: 0 };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BarChart3 color="var(--accent-primary)" size={24} /> Admin Platform Analytics & Reports
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Platform metrics, attempt statistics, and CSV data exports.</p>
          </div>

          <button onClick={handleExportCSV} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <Download size={16} /> Export Data (CSV)
          </button>
        </div>

        {/* Overview Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <Users size={24} color="var(--accent-primary)" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Total Registered Users</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{data.totalUsers}</div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <Trophy size={24} color="var(--accent-secondary)" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Total Quizzes</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{data.totalQuizzes}</div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <HelpCircle size={24} color="var(--accent-cyan)" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Question Bank Items</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{data.totalQuestions}</div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <Activity size={24} color="var(--accent-emerald)" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Total Quiz Attempts</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{data.totalAttempts}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
