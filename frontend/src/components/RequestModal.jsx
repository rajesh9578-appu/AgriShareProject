import React, { useState } from 'react';
import { X, Calendar, MapPin, IndianRupee, Tractor, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getEquipmentImage } from '../utils/equipmentImages';

const RequestModal = ({ resource, isOpen, onClose, onSuccess }) => {
  const { user, profile } = useAuth();
  const { addToast } = useToast();

  const [startDate, setStartDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [durationDays, setDurationDays] = useState(1);
  const [purpose, setPurpose] = useState('');
  const [crop, setCrop] = useState(profile?.cropsCultivated?.[0] || 'Paddy');
  const [landArea, setLandArea] = useState(profile?.landArea || 2);
  const [additionalMessage, setAdditionalMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !resource) return null;

  // Calculate End Date based on start and duration
  const calcEndDate = () => {
    const s = new Date(startDate);
    s.setDate(s.getDate() + (Number(durationDays) || 1) - 1);
    return s.toISOString().split('T')[0];
  };

  const estimatedTotal = (resource.pricing?.price || 0) * (Number(durationDays) || 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Please login to request equipment.', 'warning');
      return;
    }

    if (!purpose.trim()) {
      addToast('Please specify the farming purpose / operation.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/resource-requests', {
        resourceId: resource._id,
        requiredStartDate: startDate,
        requiredEndDate: calcEndDate(),
        durationDays: Number(durationDays),
        purpose: purpose.trim(),
        crop,
        landArea: { value: Number(landArea), unit: 'acres' },
        additionalMessage: additionalMessage.trim()
      });

      if (res.data.success) {
        addToast('Resource request sent to the owner! 🌾', 'success');
        if (onSuccess) onSuccess(res.data.request);
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit request.';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '560px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              Request Agricultural Equipment
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>
              Send booking proposal to resource owner
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Resource Summary Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '12px 16px',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}
        >
          <img
            src={getEquipmentImage(resource)}
            alt={resource.name}
            style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
          />
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{resource.name}</h4>
            <div style={{ fontSize: '12px', color: '#15803d', fontWeight: '600' }}>
              ₹{resource.pricing?.price} / {resource.pricing?.unit?.replace('_', ' ')}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              <MapPin size={12} style={{ display: 'inline' }} /> {resource.location?.district}
            </div>
          </div>
        </div>

        {/* Request Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Required Start Date</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Duration (Days)</label>
              <input
                type="number"
                className="form-control"
                value={durationDays}
                min="1"
                max="30"
                onChange={(e) => setDurationDays(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Cultivated Crop</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Paddy (Rice), Cotton"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Farm Land Area (Acres)</label>
              <input
                type="number"
                step="0.5"
                min="0.1"
                className="form-control"
                value={landArea}
                onChange={(e) => setLandArea(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Farming Operation / Purpose *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Primary deep plowing and wet puddling"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes for Equipment Owner (Optional)</label>
            <textarea
              className="form-control"
              placeholder="e.g. Field is accessible by 12ft village road, preferred arrival time 7:00 AM"
              value={additionalMessage}
              onChange={(e) => setAdditionalMessage(e.target.value)}
            />
          </div>

          {/* Pricing Preview */}
          <div
            style={{
              padding: '12px 16px',
              background: '#f0fdf4',
              borderRadius: '10px',
              border: '1px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}
          >
            <div>
              <div style={{ fontSize: '12px', color: '#166534' }}>Estimated Rental Total</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                ({durationDays} day(s) × ₹{resource.pricing?.price})
              </div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#15803d' }}>
              ₹{estimatedTotal}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Submitting Request...' : 'Send Request to Owner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestModal;
