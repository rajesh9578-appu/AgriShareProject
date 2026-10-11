import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

const MatchBadge = ({ score, reason, badges = [] }) => {
  if (!score && (!badges || badges.length === 0)) return null;

  const getScoreColor = (val) => {
    if (val >= 90) return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
    if (val >= 75) return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' };
    return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
  };

  const colors = getScoreColor(score || 85);

  return (
    <div style={{ marginTop: '8px', marginBottom: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        {score && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '700',
              background: colors.bg,
              color: colors.text,
              border: `1px solid ${colors.border}`
            }}
          >
            <Sparkles size={12} /> {score}% Match
          </span>
        )}

        {badges.map((b, idx) => (
          <span
            key={idx}
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '20px',
              background: '#f1f5f9',
              color: '#475569',
              border: '1px solid #e2e8f0',
              fontWeight: '500'
            }}
          >
            {b}
          </span>
        ))}
      </div>

      {reason && (
        <div
          style={{
            fontSize: '12px',
            color: '#15803d',
            background: '#f0fdf4',
            padding: '6px 10px',
            borderRadius: '6px',
            marginTop: '6px',
            borderLeft: '3px solid #16a34a',
            lineHeight: '1.4'
          }}
        >
          <strong>Why it matches:</strong> {reason}
        </div>
      )}
    </div>
  );
};

export default MatchBadge;
