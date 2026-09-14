import React, { useState, useEffect } from 'react';
import ImageModal from './ImageModal';

export default function LogoHeader({ title, subtitle, logoUrl }) {
  const [currentLogo, setCurrentLogo] = useState(logoUrl || '/logo.jpg');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (logoUrl) {
      setCurrentLogo(logoUrl);
      return;
    }

    // Fetch dynamic logo from backend API
    fetch('/api/settings/logo')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.logoUrl) {
          setCurrentLogo(data.logoUrl);
        }
      })
      .catch(() => {});
  }, [logoUrl]);

  return (
    <>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        marginBottom: '28px'
      }}>
        {/* 80px Circular Logo Container with Soft Shadow & Click Handler */}
        <div 
          onClick={() => setShowModal(true)}
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
            marginBottom: '16px',
            cursor: 'pointer',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.08)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(99, 102, 241, 0.55)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(99, 102, 241, 0.35)';
          }}
        >
          <img 
            src={currentLogo} 
            alt="Logo" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              if (e.target.nextSibling) {
                e.target.nextSibling.style.display = 'flex';
              }
            }}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
          {/* Fallback Emblem */}
          <div style={{
            display: 'none',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: '#1e293b',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6366f1',
            fontSize: '1.8rem',
            fontWeight: 'bold'
          }}>
            QM
          </div>
        </div>

        {/* Centered Heading & Subtitle */}
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '360px' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Full Image Lightbox Modal */}
      {showModal && (
        <ImageModal 
          imageUrl={currentLogo} 
          title={`${title || 'Application'} Logo (Full View)`} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  );
}
