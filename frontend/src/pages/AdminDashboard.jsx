import React, { useState } from 'react';
import { LogOut, Image, Upload, CheckCircle, AlertCircle, ShieldCheck, Trophy, HelpCircle, Users, BarChart3, Settings, ArrowLeft, Crop } from 'lucide-react';
import AdminQuizManager from './AdminQuizManager';
import AdminUserHistory from './AdminUserHistory';
import AdminAnalytics from './AdminAnalytics';

import ImageModal from '../components/ImageModal';
import ImageCropModal from '../components/ImageCropModal';

export default function AdminDashboard({ adminSession, setAdminSession, websiteName = 'QuizMaster', siteSettings, onWebsiteNameUpdated, onLogoUpdated, onSettingsUpdated, onBack }) {
  const [activeAdminTab, setActiveAdminTab] = useState('quizzes'); // 'quizzes' | 'appearance' | 'users' | 'analytics'

  const [siteNameInput, setSiteNameInput] = useState(websiteName);
  const [savingSiteName, setSavingSiteName] = useState(false);
  const [siteNameMessage, setSiteNameMessage] = useState({ type: '', text: '' });

  const [logoInput, setLogoInput] = useState('');
  const [previewLogo, setPreviewLogo] = useState('');
  const [savingLogo, setSavingLogo] = useState(false);
  const [logoMessage, setLogoMessage] = useState({ type: '', text: '' });
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showLogoCropModal, setShowLogoCropModal] = useState(false);

  // Background Photo State
  const [bgPhotoUrl, setBgPhotoUrl] = useState(siteSettings?.backgroundImage?.url || '');
  const [bgPhotoEnabled, setBgPhotoEnabled] = useState(siteSettings?.backgroundImage?.enabled ?? false);
  const [bgPhotoPosition, setBgPhotoPosition] = useState(siteSettings?.backgroundImage?.position || 'center');
  const [bgPhotoZoom, setBgPhotoZoom] = useState(siteSettings?.backgroundImage?.zoom || 1);
  const [showPhotoCropModal, setShowPhotoCropModal] = useState(false);

  // Background Music State
  const [bgMusicUrl, setBgMusicUrl] = useState(siteSettings?.backgroundMusic?.url || '');
  const [bgMusicEnabled, setBgMusicEnabled] = useState(siteSettings?.backgroundMusic?.enabled ?? false);
  const [bgMusicVolume, setBgMusicVolume] = useState(siteSettings?.backgroundMusic?.volume ?? 0.5);
  const [isPreviewAudioPlaying, setIsPreviewAudioPlaying] = useState(false);
  const previewAudioRef = React.useRef(null);

  const [appearanceSaving, setAppearanceSaving] = useState(false);
  const [appearanceMessage, setAppearanceMessage] = useState({ type: '', text: '' });

  // Sync props when siteSettings changes
  useEffect(() => {
    if (siteSettings) {
      if (siteSettings.backgroundImage) {
        setBgPhotoUrl(siteSettings.backgroundImage.url || '');
        setBgPhotoEnabled(Boolean(siteSettings.backgroundImage.enabled));
        setBgPhotoPosition(siteSettings.backgroundImage.position || 'center');
        setBgPhotoZoom(siteSettings.backgroundImage.zoom || 1);
      }
      if (siteSettings.backgroundMusic) {
        setBgMusicUrl(siteSettings.backgroundMusic.url || '');
        setBgMusicEnabled(Boolean(siteSettings.backgroundMusic.enabled));
        setBgMusicVolume(siteSettings.backgroundMusic.volume ?? 0.5);
      }
    }
  }, [siteSettings]);

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
        if (onSettingsUpdated) onSettingsUpdated();
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

  // Handle local background photo file upload (JPG, JPEG, PNG, WEBP)
  const handleBgPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setAppearanceMessage({ type: 'error', text: 'Unsupported image format. Please select JPG, JPEG, PNG, or WEBP.' });
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setAppearanceMessage({ type: 'error', text: 'File size exceeds 15MB limit. Please select a smaller photo.' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setBgPhotoUrl(reader.result);
      setAppearanceMessage({ type: 'info', text: 'Photo selected! Click "Save Appearance Settings" to apply globally.' });
    };
    reader.readAsDataURL(file);
  };

  // Handle local background music file upload (MP3, WAV, OGG)
  const handleBgMusicUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-wav'];
    const isAudioExt = /\.(mp3|wav|ogg)$/i.test(file.name);

    if (!validTypes.includes(file.type.toLowerCase()) && !isAudioExt) {
      setAppearanceMessage({ type: 'error', text: 'Unsupported audio format. Please select an MP3, WAV, or OGG file.' });
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setAppearanceMessage({ type: 'error', text: 'File size exceeds 15MB limit. Please select a smaller audio file.' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setBgMusicUrl(reader.result);
      setAppearanceMessage({ type: 'info', text: 'Audio file loaded! Click "Save Appearance Settings" to apply globally.' });
    };
    reader.readAsDataURL(file);
  };

  // Save Appearance & Media Settings to Backend API / MySQL
  const handleSaveAppearance = async (e) => {
    if (e) e.preventDefault();
    setAppearanceMessage({ type: '', text: '' });
    setAppearanceSaving(true);

    try {
      const res = await fetch('/api/admin/appearance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminSession.token}`
        },
        body: JSON.stringify({
          websiteName: siteNameInput.trim(),
          logoUrl: logoInput.trim() || undefined,
          backgroundImage: {
            url: bgPhotoUrl,
            enabled: bgPhotoEnabled,
            position: bgPhotoPosition,
            zoom: bgPhotoZoom
          },
          backgroundMusic: {
            url: bgMusicUrl,
            enabled: bgMusicEnabled,
            volume: bgMusicVolume
          }
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAppearanceMessage({ type: 'success', text: 'Website Background Photo & Music settings saved permanently to MySQL!' });
        if (onSettingsUpdated) onSettingsUpdated();
      } else {
        setAppearanceMessage({ type: 'error', text: data.message || 'Failed to save appearance settings.' });
      }
    } catch (err) {
      setAppearanceMessage({ type: 'error', text: 'Connection error while saving appearance settings.' });
    } finally {
      setAppearanceSaving(false);
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
        if (onSettingsUpdated) onSettingsUpdated();
      } else {
        setLogoMessage({ type: 'error', text: data.message || 'Failed to update logo.' });
      }
    } catch (err) {
      setLogoMessage({ type: 'error', text: 'Connection error while saving logo.' });
    } finally {
      setSavingLogo(false);
    }
  };

  const togglePreviewAudio = () => {
    if (!bgMusicUrl) return;

    if (isPreviewAudioPlaying) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setIsPreviewAudioPlaying(false);
    } else {
      if (!previewAudioRef.current || previewAudioRef.current.src !== bgMusicUrl) {
        previewAudioRef.current = new Audio(bgMusicUrl);
        previewAudioRef.current.volume = bgMusicVolume;
      }
      previewAudioRef.current.play()
        .then(() => setIsPreviewAudioPlaying(true))
        .catch(() => setIsPreviewAudioPlaying(false));
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
          onClick={() => setActiveAdminTab('appearance')}
          className={`btn ${activeAdminTab === 'appearance' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem' }}
        >
          <Image size={16} /> Website Appearance & Backgrounds
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
          <Settings size={16} /> Website Title & Logo
        </button>
      </div>

      {/* VIEW 1: QUIZZES & QUESTIONS MANAGER */}
      {activeAdminTab === 'quizzes' && (
        <AdminQuizManager adminSession={adminSession} />
      )}

      {/* VIEW 2: WEBSITE APPEARANCE (PHOTO & MUSIC) */}
      {activeAdminTab === 'appearance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {appearanceMessage.text && (
            <div style={{
              background: appearanceMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : appearanceMessage.type === 'info' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              border: `1px solid ${appearanceMessage.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : appearanceMessage.type === 'info' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
              color: appearanceMessage.type === 'success' ? 'var(--accent-emerald)' : appearanceMessage.type === 'info' ? 'var(--accent-primary)' : 'var(--accent-rose)',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              {appearanceMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              {appearanceMessage.text}
            </div>
          )}

          {/* BACKGROUND PHOTO MANAGEMENT */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '10px', borderRadius: '12px' }}>
                  <Image size={22} color="var(--accent-primary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Background Photo Settings</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Upload, preview, crop, and position a custom background photo for all website users.</p>
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>
                <input 
                  type="checkbox"
                  checked={bgPhotoEnabled}
                  onChange={(e) => setBgPhotoEnabled(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                />
                Enable Background Photo for All Users
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              {/* Photo Upload & URL Inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
                    Upload Photo (JPG, JPEG, PNG, WEBP)
                  </label>
                  <input 
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleBgPhotoUpload}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
                    Or Direct Photo URL
                  </label>
                  <input 
                    type="text"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={bgPhotoUrl}
                    onChange={(e) => setBgPhotoUrl(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Position & Zoom Controls */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', color: 'var(--text-muted)' }}>
                      Positioning
                    </label>
                    <select
                      value={bgPhotoPosition}
                      onChange={(e) => setBgPhotoPosition(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <option value="center">Center</option>
                      <option value="cover">Cover Fill</option>
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', color: 'var(--text-muted)' }}>
                      Zoom ({bgPhotoZoom}x)
                    </label>
                    <input 
                      type="range"
                      min="1"
                      max="2.5"
                      step="0.1"
                      value={bgPhotoZoom}
                      onChange={(e) => setBgPhotoZoom(parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  {bgPhotoUrl && (
                    <button 
                      type="button" 
                      onClick={() => setShowPhotoCropModal(true)}
                      className="btn btn-secondary" 
                      style={{ fontSize: '0.8rem', flex: 1 }}
                    >
                      <Crop size={14} /> Crop Photo
                    </button>
                  )}
                  {bgPhotoUrl && (
                    <button 
                      type="button" 
                      onClick={() => { setBgPhotoUrl(''); setAppearanceMessage({ type: 'info', text: 'Photo cleared. Save settings to confirm.' }); }}
                      className="btn btn-secondary" 
                      style={{ fontSize: '0.8rem', color: 'var(--accent-rose)' }}
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>

              {/* Photo Live Preview Box */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                minHeight: '180px',
                overflow: 'hidden'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '8px', zIndex: 2 }}>
                  Live Background Preview
                </div>
                {bgPhotoUrl ? (
                  <div style={{
                    width: '100%',
                    height: '140px',
                    borderRadius: '10px',
                    backgroundImage: `url(${bgPhotoUrl})`,
                    backgroundSize: bgPhotoPosition === 'cover' ? 'cover' : 'contain',
                    backgroundPosition: bgPhotoPosition,
                    backgroundRepeat: 'no-repeat',
                    transform: `scale(${bgPhotoZoom})`,
                    transition: 'transform 0.2s ease',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)'
                  }} />
                ) : (
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textAlign: 'center' }}>
                    No background photo selected. Default gradient dark theme will be shown.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BACKGROUND MUSIC MANAGEMENT */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '10px', borderRadius: '12px' }}>
                  <BarChart3 size={22} color="var(--accent-emerald)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Background Music Settings</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Upload, preview, set volume, and enable background audio playback across the website.</p>
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>
                <input 
                  type="checkbox"
                  checked={bgMusicEnabled}
                  onChange={(e) => setBgMusicEnabled(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-emerald)', cursor: 'pointer' }}
                />
                Enable Background Music for All Users
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
                    Upload Music File (MP3, WAV, OGG)
                  </label>
                  <input 
                    type="file"
                    accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
                    onChange={handleBgMusicUpload}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
                    Or Direct Music URL
                  </label>
                  <input 
                    type="text"
                    placeholder="https://example.com/audio.mp3"
                    value={bgMusicUrl}
                    onChange={(e) => setBgMusicUrl(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', color: 'var(--text-muted)' }}>
                    Default Volume ({Math.round(bgMusicVolume * 100)}%)
                  </label>
                  <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={bgMusicVolume}
                    onChange={(e) => setBgMusicVolume(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent-emerald)', cursor: 'pointer' }}
                  />
                </div>
              </div>

              {/* Audio Preview Box */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)' }}>
                  Audio Player Preview
                </div>
                {bgMusicUrl ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={togglePreviewAudio}
                      className="btn btn-primary"
                      style={{ fontSize: '0.85rem', padding: '8px 16px', borderRadius: '20px' }}
                    >
                      {isPreviewAudioPlaying ? 'Pause Audio Preview' : '▶ Play Audio Preview'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setBgMusicUrl(''); setIsPreviewAudioPlaying(false); }}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.8rem', color: 'var(--accent-rose)' }}
                    >
                      Remove Music
                    </button>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textAlign: 'center' }}>
                    No music file loaded. Select an MP3 or audio URL above.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SAVE ALL APPEARANCE SETTINGS BUTTON */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              onClick={handleSaveAppearance}
              disabled={appearanceSaving}
              className="btn btn-primary"
              style={{ fontSize: '1rem', padding: '12px 28px', borderRadius: '12px' }}
            >
              <Upload size={18} /> {appearanceSaving ? 'Saving Appearance to MySQL...' : 'SAVE ALL APPEARANCE SETTINGS'}
            </button>
          </div>

          {showPhotoCropModal && (
            <ImageCropModal
              isOpen={showPhotoCropModal}
              initialImage={bgPhotoUrl}
              title="Crop Background Photo"
              onClose={() => setShowPhotoCropModal(false)}
              onCropComplete={(croppedUrl) => {
                setBgPhotoUrl(croppedUrl);
                setShowPhotoCropModal(false);
              }}
            />
          )}
        </div>
      )}

      {/* VIEW 3: USER DIRECTORY & COMPLETE HISTORY */}
      {activeAdminTab === 'users' && (
        <AdminUserHistory adminSession={adminSession} />
      )}

      {/* VIEW 4: ANALYTICS & CSV EXPORT */}
      {activeAdminTab === 'analytics' && (
        <AdminAnalytics adminSession={adminSession} />
      )}

      {/* VIEW 5: WEBSITE SETTINGS & LOGO CUSTOMIZATION */}
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

