import React, { useState } from 'react';
import { User, Phone, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import LogoHeader from '../components/LogoHeader';

export default function UserLogin({ userSession, setUserSession, logoUrl, websiteName = 'QuizMaster' }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStartQuiz = async (e) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/\D/g, '');

    if (!name.trim()) {
      setError('Please enter your Full Name.');
      return;
    }

    if (!/^\d{10}$/.test(cleanPhone)) {
      setError('Phone number must be exactly 10 digits (numbers only).');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: cleanPhone })
      });

      let data = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error(`Server connection error (HTTP ${res.status}). Ensure backend Node server is running.`);
      }

      if (res.ok && data && data.success) {
        setUserSession(data.user);
      } else {
        setError(data?.message || `Registration failed (Status ${res.status}).`);
      }
    } catch (err) {
      setError(err.message || 'Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetUser = () => {
    setUserSession(null);
    setName('');
    setPhone('');
  };

  if (userSession) {
    return (
      <div className="glass-panel" style={{ maxWidth: '460px', margin: '0 auto', padding: '36px' }}>
        <LogoHeader 
          title={`Hello, ${userSession.name}!`} 
          subtitle={`You are ready to begin your timed quiz assessment on ${websiteName}.`} 
        />

        <div style={{
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Registered Phone</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{userSession.phone}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
            <Play size={18} /> Start Quiz Session Now
          </button>
          <button onClick={handleResetUser} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
            Change Name / Phone
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ maxWidth: '440px', margin: '0 auto', padding: '36px' }}>
      {/* Centered 80px Circular Logo Header */}
      <LogoHeader 
        title="Start Your Quiz" 
        subtitle="Enter your name & 10-digit phone number to begin" 
        logoUrl={logoUrl}
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

      <form onSubmit={handleStartQuiz}>
        {/* Name Field */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
            Full Name
          </label>
          <div style={{ position: 'relative' }}>
            <User size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
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

        {/* Phone Field */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
            Phone Number (10 Digits)
          </label>
          <div style={{ position: 'relative' }}>
            <Phone size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="tel" 
              required
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="e.g. 9876543210"
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

        {/* Start Button */}
        <button 
          type="submit" 
          disabled={loading} 
          className="btn btn-primary" 
          style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
        >
          {loading ? 'Registering...' : 'Continue to Quiz'}
        </button>
      </form>
    </div>
  );
}
