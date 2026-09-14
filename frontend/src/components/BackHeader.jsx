import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function BackHeader({ label = 'Back', onBack, style }) {
  return (
    <button 
      onClick={onBack} 
      className="btn btn-secondary" 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.85rem',
        marginBottom: '20px',
        ...style
      }}
    >
      <ArrowLeft size={16} /> {label}
    </button>
  );
}
