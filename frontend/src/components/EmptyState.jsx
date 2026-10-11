import React from 'react';
import { Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon = Sprout,
  title = 'No items found',
  description = 'There are no records to display at this moment.',
  actionText,
  actionLink,
  onActionClick
}) => {
  return (
    <div
      className="card"
      style={{
        textAlign: 'center',
        padding: '48px 24px',
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px dashed #cbd5e1',
        margin: '20px 0'
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#f0fdf4',
          color: '#15803d',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}
      >
        <Icon size={32} />
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '420px', margin: '0 auto 20px' }}>
        {description}
      </p>

      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-primary btn-sm">
          {actionText}
        </Link>
      )}

      {actionText && onActionClick && !actionLink && (
        <button onClick={onActionClick} className="btn btn-primary btn-sm">
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
