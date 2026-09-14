import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  UserCheck, 
  Lock, 
  Activity, 
  Server, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  BarChart3,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';

import AdminLogin from './pages/AdminLogin';
import UserLogin from './pages/UserLogin';
import UserDashboard from './pages/UserDashboard';
import MovieQuizView from './pages/MovieQuizView';
import QuizResult from './pages/QuizResult';
import LeaderboardView from './pages/LeaderboardView';

import ImageModal from './components/ImageModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('user'); // 'user' | 'leaderboard' | 'admin' | 'status'
  
  // Persist admin session in localStorage across refreshes/redeployments
  const [adminSession, setAdminSessionState] = useState(() => {
    try {
      const saved = localStorage.getItem('quizmaster_admin_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Persist user session in localStorage across refreshes/redeployments
  const [userSession, setUserSessionState] = useState(() => {
    try {
      const saved = localStorage.getItem('quizmaster_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const setAdminSession = (session) => {
    setAdminSessionState(session);
    if (session) {
      localStorage.setItem('quizmaster_admin_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('quizmaster_admin_session');
    }
  };

  const setUserSession = (user) => {
    setUserSessionState(user);
    if (user) {
      localStorage.setItem('quizmaster_user_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('quizmaster_user_session');
    }
  };
  
  // Mobile Navigation Drawer State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Quiz taking view state
  const [quizState, setQuizState] = useState('dashboard'); // 'dashboard' | 'taking' | 'result'
  const [selectedQuizId, setSelectedQuizId] = useState(1);
  const [quizResultData, setQuizResultData] = useState(null);

  // Dynamic Website Settings & Theme Switcher State
  const [websiteName, setWebsiteName] = useState('SriGanesh Friends Circle');
  const [theme, setTheme] = useState(localStorage.getItem('quizmaster_theme') || 'dark');
  const [appLogo, setAppLogo] = useState('/logo.jpg');
  const [showLogoModal, setShowLogoModal] = useState(false);

  const [backendStatus, setBackendStatus] = useState({ loading: true, online: false, data: null });
  const [dbStatus, setDbStatus] = useState({ loading: true, connected: false, message: '' });

  // Sync website name with document.title
  useEffect(() => {
    document.title = `${websiteName} - Quiz Platform`;
  }, [websiteName]);

  // Sync theme attribute to HTML document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('quizmaster_theme', theme);

    if (theme === 'light') {
      document.body.style.backgroundColor = '#f1f5f9';
      document.body.style.color = '#0f172a';
    } else {
      document.body.style.backgroundColor = '#0f172a';
      document.body.style.color = '#f8fafc';
    }
  }, [theme]);

  // Fetch active settings (website name & logo)
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        if (data.websiteName) setWebsiteName(data.websiteName);
        if (data.logoUrl) setAppLogo(data.logoUrl);
      }
    } catch (err) {}
  };

  // Check API health
  const checkConnectivity = async () => {
    setBackendStatus(prev => ({ ...prev, loading: true }));
    setDbStatus(prev => ({ ...prev, loading: true }));

    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setBackendStatus({ loading: false, online: true, data });
      } else {
        setBackendStatus({ loading: false, online: false, data: null });
      }

      const dbRes = await fetch('/api/db-status');
      if (dbRes.ok) {
        const dbData = await dbRes.json();
        setDbStatus({ 
          loading: false, 
          connected: dbData.database?.connected || false, 
          message: dbData.database?.message || '' 
        });
      } else {
        setDbStatus({ loading: false, connected: false, message: 'DB endpoint unreachable' });
      }
    } catch (err) {
      setBackendStatus({ loading: false, online: false, data: null });
      setDbStatus({ loading: false, connected: false, message: 'Server unreachable' });
    }
  };

  useEffect(() => {
    checkConnectivity();
    fetchSettings();

    // Re-verify existing user session from MySQL on reload
    if (userSession?.id) {
      fetch(`/api/users/me/${userSession.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            setUserSession(data.user);
          }
        })
        .catch(() => {});
    }
  }, []);

  return (
    <div className="container">
      {/* Top Navbar Header */}
      <header style={{ 
        display: 'flex', 
        justify: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px',
        position: 'relative'
      }}>
        {/* Brand Logo & Dynamic Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div 
            onClick={() => setShowLogoModal(true)}
            title="Click to view full image logo"
            style={{ 
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              padding: '2px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
              display: 'flex',
              overflow: 'hidden',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <img src={appLogo} alt={`${websiteName} Logo`} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
              <span className="gradient-text">{websiteName}</span>
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Quiz & Leaderboard Platform</p>
          </div>
        </div>

        {/* Desktop Controls & Mobile Hamburger Toggle */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Theme Switcher Button */}
          <button 
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            className="btn btn-secondary"
            title="Toggle Light/Dark Theme"
            style={{ padding: '8px 12px', borderRadius: '12px', height: '40px' }}
          >
            {theme === 'dark' ? <Sun size={18} color="var(--accent-amber)" /> : <Moon size={18} color="var(--accent-primary)" />}
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="btn btn-secondary hamburger-btn"
            style={{ padding: '8px 12px', height: '40px', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Responsive Mobile / Desktop Navigation Links */}
        <nav 
          className="nav-responsive"
          style={{ 
            display: mobileMenuOpen ? 'flex' : 'none', 
            width: '100%',
            flexDirection: 'column',
            gap: '8px', 
            background: 'rgba(30, 41, 59, 0.95)', 
            backdropFilter: 'blur(16px)',
            padding: '12px', 
            borderRadius: '16px', 
            border: '1px solid var(--border-color)',
            marginTop: '8px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <button 
            onClick={() => { setActiveTab('user'); setQuizState('dashboard'); setMobileMenuOpen(false); }}
            className={`btn ${activeTab === 'user' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '10px 16px', justifyContent: 'flex-start' }}
          >
            <UserCheck size={16} /> User Portal
          </button>

          <button 
            onClick={() => { setActiveTab('leaderboard'); setMobileMenuOpen(false); }}
            className={`btn ${activeTab === 'leaderboard' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '10px 16px', justifyContent: 'flex-start' }}
          >
            <BarChart3 size={16} /> Leaderboard
          </button>

          <button 
            onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
            className={`btn ${activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '10px 16px', justifyContent: 'flex-start' }}
          >
            <Lock size={16} /> Admin Panel
          </button>

          <button 
            onClick={() => { setActiveTab('status'); setMobileMenuOpen(false); }}
            className={`btn ${activeTab === 'status' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '10px 16px', justifyContent: 'flex-start' }}
          >
            <Activity size={16} /> Diagnostics
          </button>
        </nav>
      </header>

      {/* Main Views */}
      <main style={{ minHeight: '520px' }}>
        {activeTab === 'user' && (
          <>
            {!userSession ? (
              <UserLogin 
                userSession={userSession} 
                setUserSession={(user) => {
                  setUserSession(user);
                  setQuizState('dashboard');
                }} 
                logoUrl={appLogo}
                websiteName={websiteName}
              />
            ) : (
              <>
                {quizState === 'dashboard' && (
                  <UserDashboard 
                    userSession={userSession}
                    setUserSession={setUserSession}
                    logoUrl={appLogo}
                    websiteName={websiteName}
                    onStartQuiz={(qId) => {
                      setSelectedQuizId(qId);
                      setQuizState('taking');
                    }}
                    onViewLeaderboard={() => setActiveTab('leaderboard')}
                  />
                )}

                {quizState === 'taking' && (
                  <MovieQuizView 
                    quizId={selectedQuizId}
                    userSession={userSession}
                    logoUrl={appLogo}
                    websiteName={websiteName}
                    onQuizComplete={(result) => {
                      setQuizResultData(result);
                      setQuizState('result');
                    }}
                    onBackToDashboard={() => setQuizState('dashboard')}
                  />
                )}

                {quizState === 'result' && quizResultData && (
                  <QuizResult 
                    result={quizResultData}
                    logoUrl={appLogo}
                    websiteName={websiteName}
                    onRetakeQuiz={() => setQuizState('taking')}
                    onViewLeaderboard={() => setActiveTab('leaderboard')}
                    onBackToDashboard={() => setQuizState('dashboard')}
                  />
                )}
              </>
            )}
          </>
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView logoUrl={appLogo} websiteName={websiteName} onBack={() => setActiveTab('user')} />
        )}

        {activeTab === 'admin' && (
          <AdminLogin 
            adminSession={adminSession} 
            setAdminSession={setAdminSession} 
            websiteName={websiteName}
            onWebsiteNameUpdated={(name) => setWebsiteName(name)}
            onLogoUpdated={(newLogo) => setAppLogo(newLogo)}
            onBack={() => setActiveTab('user')}
          />
        )}

        {activeTab === 'status' && (
          <div className="glass-panel" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Server color="var(--accent-primary)" size={24} /> System Diagnostics & Health
              </h2>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button onClick={() => setActiveTab('user')} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                  Back to User Portal
                </button>
                <button onClick={checkConnectivity} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                  <RefreshCw size={14} className={backendStatus.loading ? 'spin' : ''} /> Refresh Status
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>Backend Express API</span>
                  {backendStatus.online ? (
                    <span className="badge badge-success"><CheckCircle2 size={12} /> Online</span>
                  ) : (
                    <span className="badge badge-danger"><AlertTriangle size={12} /> Offline</span>
                  )}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {backendStatus.online ? `Backend API Active (${backendStatus.data?.app || 'SriGanesh Friends Circle'})` : 'Backend API offline or unreachable.'}
                </p>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>MySQL Database Connector</span>
                  {dbStatus.connected ? (
                    <span className="badge badge-success"><CheckCircle2 size={12} /> Connected</span>
                  ) : (
                    <span className="badge badge-warning"><Database size={12} /> Config Ready</span>
                  )}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {dbStatus.message || 'Configured via mysql2 pool.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '48px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
        {websiteName} Application &bull; Timed Quiz & Leaderboard System
      </footer>

      {showLogoModal && (
        <ImageModal 
          imageUrl={appLogo} 
          title={`${websiteName} Logo (Full View)`} 
          onClose={() => setShowLogoModal(false)} 
        />
      )}
    </div>
  );
}
