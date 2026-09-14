import React, { useState } from 'react';
import { LogOut, Image, Upload, CheckCircle, AlertCircle, ShieldCheck, Trophy, HelpCircle, Users, BarChart3, Settings, ArrowLeft, Crop } from 'lucide-react';
import AdminQuizManager from './AdminQuizManager';
import AdminUserHistory from './AdminUserHistory';
import AdminAnalytics from './AdminAnalytics';

import ImageModal from '../components/ImageModal';
import ImageCropModal from '../components/ImageCropModal';

export default function AdminDashboard({ adminSession, setAdminSession, websiteName = 'QuizMaster', onWebsiteNameUpdated, onLogoUpdated, onBack }) {
  const [activeAdminTab, setActiveAdminTab] = useState('quizzes'); // 'quizzes' | 'logo' | 'users' | 'analytics'

  const [siteNameInput, setSiteNameInput] = useState(websiteName);
  const [savingSiteName, setSavingSiteName] = useState(false);
  const [siteNameMessage, setSiteNameMessage] = useState({ type: '', text: '' });

  const [logoInput, setLogoInput] = useState('');
  const [previewLogo, setPreviewLogo] = useState('');
  const [savingLogo, setSavingLogo] = useState(false);
  const [logoMessage, setLogoMessage] = useState({ type: '', text: '' });
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showLogoCropModal, setShowLogoCropModal] = useState(false);

  // Handle Website Name Save
  const handleSaveWebsiteName = async (e) => {
    e.preventDefault();
    setSiteNameMessage({ type: '', text: '' });

    if (!siteNameInput.trim()) {
      setSiteNameMessage({ type: 'error', text: 'Please enter a valid website name.' });
      return;
    }

    setSavingSiteName(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminSession.token}`
        },
        body: JSON.stringify({ website_name: siteNameInput.trim() })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSiteNameMessage({ type: 'success', text: 'Website name updated successfully!' });
        if (onWebsiteNameUpdated) onWebsiteNameUpdated(data.websiteName);
      } else {
        setSiteNameMessage({ type: 'error', text: data.message || 'Failed to update website name.' });
      }
    } catch (err) {
      setSiteNameMessage({ type: 'error', text: 'Connection error while saving website name.' });
    } finally {
      setSavingSiteName(false);
    }
  };

  // Handle local file photo upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoInput(reader.result);
        setPreviewLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Logo to Backend API
  const handleSaveLogo = async (e) => {
    e.preventDefault();
    setLogoMessage({ type: '', text: '' });

    if (!logoInput.trim()) {
      setLogoMessage({ type: 'error', text: 'Please upload an image file or enter an image URL.' });
      return;
    }

    setSavingLogo(true);

    try {
      const res = await fetch('/api/admin/logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminSession.token}`
        },
        body: JSON.stringify({ logoUrl: logoInput })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setLogoMessage({ type: 'success', text: 'Application logo updated successfully!' });
        if (onLogoUpdated) onLogoUpdated(data.logoUrl);
      } else {
        setLogoMessage({ type: 'error', text: data.message || 'Failed to update logo.' });
      }
    } catch (err) {
      setLogoMessage({ type: 'error', text: 'Connection error while saving logo.' });
    } finally {
      setSavingLogo(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Admin Header Bar */}
      <div className="glass-panel" style={{ padding: '24px 32px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '10px', borderRadius: '12px' }}>
            <ShieldCheck size={28} color="var(--accent-primary)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Admin Control Panel</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Logged in as: <strong>{adminSession.admin.username}</strong></p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {onBack && (
            <button onClick={onBack} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
              <ArrowLeft size={16} /> User Portal
            </button>
          )}
          <button onClick={() => setAdminSession(null)} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Admin Menu Navigation */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', background: 'rgba(30, 41, 59, 0.5)', padding: '8px', borderRadius: '16px', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveAdminTab('quizzes')}
          className={`btn ${activeAdminTab === 'quizzes' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem' }}
        >
          <Trophy size={16} /> Quizzes & Movie Questions
        </button>

        <button 
          onClick={() => setActiveAdminTab('users')}
          className={`btn ${activeAdminTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem' }}
        >
          <Users size={16} /> User Directory & Complete History
        </button>

        <button 
          onClick={() => setActiveAdminTab('analytics')}
          className={`btn ${activeAdminTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem' }}
        >
          <BarChart3 size={16} /> Analytics & CSV Export
        </button>

        <button 
          onClick={() => setActiveAdminTab('logo')}
          className={`btn ${activeAdminTab === 'logo' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem' }}
        >
          <Settings size={16} /> Website Settings & Logo
        </button>
      </div>

      {/* VIEW 1: QUIZZES & QUESTIONS MANAGER */}
      {activeAdminTab === 'quizzes' && (
        <AdminQuizManager adminSession={adminSession} />
      )}

      {/* VIEW 2: USER DIRECTORY & COMPLETE HISTORY */}
      {activeAdminTab === 'users' && (
        <AdminUserHistory adminSession={adminSession} />
      )}

      {/* VIEW 3: ANALYTICS & CSV EXPORT */}
      {activeAdminTab === 'analytics' && (
        <AdminAnalytics adminSession={adminSession} />
      )}

      {/* VIEW 4: WEBSITE SETTINGS & LOGO CUSTOMIZATION */}
      {activeAdminTab === 'logo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* WEBSITE NAME SETTINGS FORM */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '10px', borderRadius: '12px' }}>
                <Settings size={22} color="var(--accent-primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Website Name Settings</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Customize the platform title displayed across headers, dashboards, and browser titles.</p>
              </div>
            </div>

            {siteNameMessage.text && (
              <div style={{
                background: siteNameMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                border: `1px solid ${siteNameMessage.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                color: siteNameMessage.type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {siteNameMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {siteNameMessage.text}
              </div>
            )}

            <form onSubmit={handleSaveWebsiteName} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Platform Title / Website Name
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Movie Mania, Quiz Arena, Cine Quiz"
                  value={siteNameInput}
                  onChange={(e) => setSiteNameInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-main)',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>
              <button type="submit" disabled={savingSiteName} className="btn btn-primary">
                {savingSiteName ? 'Saving Name...' : 'Save Website Name'}
              </button>
            </form>
          </div>

          {/* LOGO CUSTOMIZATION FORM */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '10px', borderRadius: '12px' }}>
                <Image size={22} color="var(--accent-secondary)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Edit & Customize App Logo</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Upload a photo or enter an image URL to update the 80px circular logo across {websiteName}.</p>
              </div>
            </div>

            {logoMessage.text && (
              <div style={{
                background: logoMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                border: `1px solid ${logoMessage.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                color: logoMessage.type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {logoMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {logoMessage.text}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', alignItems: 'center' }}>
              {/* Circular Logo Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '10px' }}>
                  Preview (80px) &bull; Click for Full View
                </div>

                <div 
                  onClick={() => setShowPreviewModal(true)}
                  title="Click to view full image"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    padding: '3px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    boxShadow: '0 6px 24px rgba(99, 102, 241, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.25s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <img 
                    src={previewLogo || logoInput || '/logo.jpg'} 
                    alt="Logo Preview" 
                    onError={(e) => { e.target.src = '/logo.jpg'; }}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                </div>
              </div>

              {showPreviewModal && (
                <ImageModal 
                  imageUrl={previewLogo || logoInput || '/logo.jpg'} 
                  title="App Logo Preview (Full View)" 
                  onClose={() => setShowPreviewModal(false)} 
                />
              )}

              {/* Upload Form */}
              <form onSubmit={handleSaveLogo} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', color: 'var(--text-muted)' }}>
                    Upload Photo from Device
                  </label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', color: 'var(--text-muted)' }}>
                    Or Image URL
                  </label>
                  <input 
                    type="text" 
                    placeholder="https://example.com/logo.jpg"
                    value={logoInput}
                    onChange={(e) => {
                      setLogoInput(e.target.value);
                      setPreviewLogo(e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowLogoCropModal(true)} 
                    className="btn btn-secondary" 
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <Crop size={16} /> Crop & Adjust Logo
                  </button>

                  <button type="submit" disabled={savingLogo} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    <Upload size={16} /> {savingLogo ? 'Saving Logo...' : 'Save & Apply New Logo'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {showLogoCropModal && (
            <ImageCropModal
              isOpen={showLogoCropModal}
              initialImage={previewLogo || logoInput || '/logo.jpg'}
              title="Crop & Resize Website Logo (1:1 Square)"
              onClose={() => setShowLogoCropModal(false)}
              onCropComplete={(croppedUrl) => {
                setLogoInput(croppedUrl);
                setPreviewLogo(croppedUrl);
                setShowLogoCropModal(false);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
