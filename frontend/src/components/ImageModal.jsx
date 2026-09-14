import React from 'react';
import { X, ZoomIn } from 'lucide-react';

export default function ImageModal({ imageUrl, title = 'Full Image View', onClose }) {
  if (!imageUrl) return null;

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '92vw',
          maxHeight: '92vh',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Header bar with title & close button */}
        <div style={{
          width: '100%',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ZoomIn size={18} color="var(--accent-primary)" /> {title}
          </h3>
          <button 
            onClick={onClose}
            className="btn btn-secondary"
            style={{
              padding: '6px 14px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            <X size={18} /> Close
          </button>
        </div>

        {/* Full Image Container */}
        <div style={{
          overflow: 'auto',
          maxHeight: '75vh',
          maxWidth: '85vw',
          display: 'flex',
          justify: 'center',
          alignItems: 'center',
          borderRadius: '12px',
          background: '#020617',
          padding: '16px'
        }}>
          <img 
            src={imageUrl} 
            alt={title} 
            style={{
              maxWidth: '100%',
              maxHeight: '70vh',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }} 
          />
        </div>
      </div>
    </div>
  );
}
