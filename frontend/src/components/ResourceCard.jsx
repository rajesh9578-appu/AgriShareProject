import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Star,
  ShieldCheck,
  Bookmark,
  Sparkles,
  Calendar,
  CheckCircle,
  UserCheck
} from 'lucide-react';
import MatchBadge from './MatchBadge';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getEquipmentImage } from '../utils/equipmentImages';

const ResourceCard = ({ resource, onRequestClick, matchScore, matchReason, badges = [] }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const displayImage = getEquipmentImage(resource);
  const fallbackImage = getEquipmentImage(resource?.category, resource?.name);

  const handleToggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      addToast('Please login to bookmark equipment', 'warning');
      return;
    }

    try {
      setSaving(true);
      const res = await api.post('/saved-resources/toggle', { resourceId: resource._id });
      if (res.data.success) {
        setIsSaved(res.data.isSaved);
        addToast(res.data.message, 'success');
      }
    } catch (err) {
      addToast('Failed to bookmark resource', 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatUnit = (u) => {
    if (!u) return 'day';
    return u.replace('per_', '').replace('_', ' ');
  };

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        overflow: 'hidden',
        position: 'relative',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      {/* Image Banner */}
      <div style={{ position: 'relative', height: '190px', width: '100%', overflow: 'hidden', background: '#e2e8f0' }}>
        <img
          src={displayImage}
          alt={resource.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackImage;
          }}
        />

        {/* Price Badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(6px)',
            color: '#ffffff',
            padding: '6px 12px',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '14px'
          }}
        >
          ₹{resource.pricing?.price}{' '}
          <span style={{ fontSize: '11px', fontWeight: '400', color: '#cbd5e1' }}>
            / {formatUnit(resource.pricing?.unit)}
          </span>
        </div>

        {/* Verification & Bookmark */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {resource.verificationStatus === 'VERIFIED' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(21, 128, 61, 0.9)',
                backdropFilter: 'blur(4px)',
                color: '#ffffff',
                padding: '4px 8px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '700'
              }}
            >
              <ShieldCheck size={13} /> Verified
            </span>
          )}

          <button
            onClick={handleToggleSave}
            disabled={saving}
            style={{
              background: isSaved ? '#15803d' : 'rgba(255, 255, 255, 0.9)',
              color: isSaved ? '#ffffff' : '#334155',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            title="Save bookmark"
          >
            <Bookmark size={16} fill={isSaved ? '#ffffff' : 'none'} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          {/* Category & Rating */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: '700',
                color: '#15803d',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {resource.category}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <span>{resource.ratingSummary?.average || 4.8}</span>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '400' }}>
                ({resource.ratingSummary?.count || 1})
              </span>
            </div>
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '6px',
              lineHeight: '1.3'
            }}
          >
            <Link to={`/resources/${resource._id}`} style={{ color: '#0f172a', textDecoration: 'none' }}>
              {resource.name}
            </Link>
          </h3>

          {/* Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#64748b', marginBottom: '10px' }}>
            <MapPin size={14} color="#15803d" />
            <span>
              {resource.location?.village ? `${resource.location.village}, ` : ''}
              <strong>{resource.location?.district}</strong>
            </span>
          </div>

          {/* AI Match explanation if provided */}
          {(matchScore || matchReason) && (
            <MatchBadge score={matchScore} reason={matchReason} badges={badges} />
          )}

          {/* Specs / Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px', marginBottom: '16px' }}>
            {resource.specs?.withOperator && (
              <span className="badge badge-verified" style={{ fontSize: '11px' }}>
                <UserCheck size={11} /> Driver Included
              </span>
            )}
            {resource.specs?.horsepower && (
              <span className="badge badge-gray" style={{ fontSize: '11px' }}>
                ⚡ {resource.specs.horsepower}
              </span>
            )}
            {resource.condition && (
              <span className="badge badge-gray" style={{ fontSize: '11px', textTransform: 'capitalize' }}>
                Condition: {resource.condition}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
          <Link to={`/resources/${resource._id}`} className="btn btn-secondary btn-sm" style={{ textAlign: 'center' }}>
            Details
          </Link>
          <button
            onClick={() => (onRequestClick ? onRequestClick(resource) : null)}
            className="btn btn-primary btn-sm"
            style={{ textAlign: 'center' }}
          >
            Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
