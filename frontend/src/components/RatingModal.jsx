import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const RatingModal = ({ booking, isOpen, onClose, onSuccess }) => {
  const { addToast } = useToast();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const availableTags = [
    'On-time Delivery',
    'Skilled Operator',
    'Excellent Condition',
    'Fuel Efficient',
    'Fair Pricing',
    'Great Communication',
    'Cooperative Owner'
  ];

  if (!isOpen || !booking) return null;

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!review.trim()) {
      addToast('Please write a brief review of your experience.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/ratings', {
        bookingId: booking._id,
        rating,
        review: review.trim(),
        tags: selectedTags
      });

      if (res.data.success) {
        addToast('Review submitted successfully! ⭐', 'success');
        if (onSuccess) onSuccess(res.data.rating);
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit review.';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '14px',
            marginBottom: '18px'
          }}
        >
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              Rate Your Experience
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>
              Ref: {booking.bookingReference} • {booking.resource?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Star Selector */}
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  <Star
                    size={32}
                    fill={(hoverRating || rating) >= star ? '#f59e0b' : 'none'}
                    color={(hoverRating || rating) >= star ? '#f59e0b' : '#cbd5e1'}
                  />
                </button>
              ))}
            </div>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#d97706' }}>
              {rating === 5
                ? 'Excellent (5 Stars)'
                : rating === 4
                ? 'Very Good (4 Stars)'
                : rating === 3
                ? 'Average (3 Stars)'
                : rating === 2
                ? 'Below Average (2 Stars)'
                : 'Poor (1 Star)'}
            </span>
          </div>

          {/* Tag Chips */}
          <div className="form-group">
            <label className="form-label">What went well? (Optional)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      border: isSelected ? '1px solid #15803d' : '1px solid #e2e8f0',
                      background: isSelected ? '#dcfce7' : '#f8fafc',
                      color: isSelected ? '#15803d' : '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review Text */}
          <div className="form-group">
            <label className="form-label">Your Review *</label>
            <textarea
              className="form-control"
              placeholder="Describe equipment performance, timeliness, operator expertise, or overall satisfaction..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
