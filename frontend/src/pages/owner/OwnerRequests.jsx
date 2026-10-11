import React, { useState, useEffect } from 'react';
import { Check, X, Clock, Tractor, User, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../context/ToastContext';
import { getEquipmentImage } from '../../utils/equipmentImages';

const OwnerRequests = () => {
  const { addToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Reject Modal state
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/resource-requests/owner-requests');
      if (res.data.success) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (requestId) => {
    try {
      setProcessingId(requestId);
      const res = await api.put(`/resource-requests/${requestId}/accept`);
      if (res.data.success) {
        addToast('Request accepted! Confirmed booking created.', 'success');
        fetchRequests();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to accept request';
      addToast(msg, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectTarget) return;

    try {
      setProcessingId(rejectTarget._id);
      const res = await api.put(`/resource-requests/${rejectTarget._id}/reject`, {
        reason: rejectionReason.trim() || 'Unavailable during the requested period'
      });
      if (res.data.success) {
        addToast('Request declined.', 'info');
        setRejectTarget(null);
        setRejectionReason('');
        fetchRequests();
      }
    } catch (err) {
      addToast('Failed to reject request', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading incoming equipment requests..." minHeight="60vh" />;
  }

  return (
    <div className="container" style={{ padding: '30px 20px 60px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>
          Incoming Farmer Requests ({requests.length})
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Review and approve booking proposals from local farmers
        </p>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          title="No Incoming Requests"
          description="You currently have no incoming equipment requests. Make sure your listings are marked Available."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {requests.map((req) => (
            <div
              key={req._id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '18px',
                padding: '20px',
                borderLeft: `4px solid ${
                  req.status === 'PENDING' ? '#d97706' : req.status === 'ACCEPTED' ? '#15803d' : '#cbd5e1'
                }`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <img
                  src={getEquipmentImage(req.resource)}
                  alt=""
                  style={{ width: '75px', height: '75px', borderRadius: '12px', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge badge-gray">{req.resource?.category}</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>
                      {req.resource?.name}
                    </span>
                  </div>

                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#15803d', marginBottom: '4px' }}>
                    Farmer: {req.farmer?.name} {req.farmer?.phone && `(${req.farmer.phone})`}
                  </div>

                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    Requested Period: <strong>{new Date(req.requiredStartDate).toLocaleDateString()}</strong> to{' '}
                    <strong>{new Date(req.requiredEndDate).toLocaleDateString()}</strong> ({req.durationDays} day(s))
                  </div>

                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                    Purpose: <strong>{req.purpose}</strong> (Crop: {req.crop}, Land: {req.landArea?.value} {req.landArea?.unit})
                  </div>

                  {req.additionalMessage && (
                    <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', marginTop: '4px' }}>
                      Note: "{req.additionalMessage}"
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ textAlign: 'right', marginRight: '8px' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#15803d' }}>
                    ₹{req.estimatedCost}
                  </div>
                  <span
                    className={
                      req.status === 'ACCEPTED'
                        ? 'badge badge-verified'
                        : req.status === 'REJECTED'
                        ? 'badge badge-danger'
                        : 'badge badge-pending'
                    }
                  >
                    {req.status}
                  </span>
                </div>

                {req.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleAccept(req._id)}
                      disabled={processingId === req._id}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Check size={14} /> Accept & Book
                    </button>
                    <button
                      onClick={() => setRejectTarget(req)}
                      disabled={processingId === req._id}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#dc2626', borderColor: '#fecaca' }}
                    >
                      <X size={14} /> Decline
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectTarget && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: '#0f172a' }}>
              Decline Equipment Request
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Specify the reason why you cannot accept this request for {rejectTarget.resource?.name}:
            </p>

            <form onSubmit={handleRejectSubmit}>
              <div className="form-group">
                <textarea
                  className="form-control"
                  placeholder="e.g. Equipment scheduled for maintenance or already reserved offline..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setRejectTarget(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger">
                  Confirm Decline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerRequests;
