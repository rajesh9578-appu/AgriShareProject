import React from 'react';

const StatsCard = ({ title, value, subtitle, icon: Icon, color = '#15803d', bg = '#f0fdf4' }) => {
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '20px 24px',
        borderRadius: '16px'
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '12px',
          background: bg,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {Icon && <Icon size={26} />}
      </div>
      <div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </div>
        <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '2px 0' }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
