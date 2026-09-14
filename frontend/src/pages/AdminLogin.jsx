import React, { useState } from 'react';
import { User, KeyRound, AlertCircle } from 'lucide-react';
import LogoHeader from '../components/LogoHeader';
import BackHeader from '../components/BackHeader';
import AdminDashboard from './AdminDashboard';

export default function AdminLogin({ adminSession, setAdminSession, websiteName = 'QuizMaster', onWebsiteNameUpdated, onLogoUpdated, onBack }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      let data = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error(`Server connection error (HTTP ${res.status}). Ensure backend Node server is running on Port 5000.`);
      }

      if (res.ok && data && data.success) {
        setAdminSession({
          token: data.token,
          admin: data.admin
        });
      } else {
        setError(data?.message || `Login failed (Status ${res.status}). Please check credentials.`);
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to authentication server. Please check backend server status.');
    } finally {
      setLoading(false);
    }
  };

  // If Admin is logged in, show Admin Dashboard with Logo & Settings Editor
  if (adminSession) {
    return (
      <AdminDashboard 
        adminSession={adminSession} 
        setAdminSession={setAdminSession} 
        websiteName={websiteName}
        onWebsiteNameUpdated={onWebsiteNameUpdated}
        onLogoUpdated={onLogoUpdated} 
        onBack={onBack}
      />
    );
  }

  return (
    <div style={{ maxWidth: '440px', margin: '0 auto' }}>
      {onBack && (
        <BackHeader label="Back to User Portal" onBack={onBack} />
      )}
      <div className="glass-panel" style={{ padding: '36px' }}>
        {/* Centered Circular Logo Header */}
        <LogoHeader 
          title="Admin Login" 
          subtitle="Enter credentials to access Admin Dashboard" 
        />

      {error && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.12)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: 'var(--accent-rose)',
          padding: '12px 14px',
          borderRadius: '10px',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px'
        }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        {/* Username Field */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
            Admin Username
          </label>
          <div style={{ position: 'relative' }}>
            <User size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Password Field - Starts Empty & Secret */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <KeyRound size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading} 
          className="btn btn-primary" 
          style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
        >
          {loading ? 'Authenticating...' : 'Sign In as Admin'}
        </button>
      </form>
    </div>
    </div>
  );
}
