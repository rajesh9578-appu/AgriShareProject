import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading platform data...', minHeight = '240px' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        gap: '12px',
        color: '#15803d'
      }}
    >
      <Loader2 size={36} className="spinner-icon" style={{ animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>{message}</span>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
