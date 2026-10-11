import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, X, AlertTriangle, MapPin, Eye, Tractor } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../context/ToastContext';
import { getEquipmentImage } from '../../utils/equipmentImages';

const AdminVerification = () => {
  const { addToast } = useToast();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [processingId, setProcessingId] = useState(null);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'All') {
        params.append('status', statusFilter);
      }
      const res = await api.get(`/admin/resources?${params.toString()}`);
      if (res.data.success) {
        setResources(res.data.resources);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [statusFilter]);

  const handleUpdateVerification = async (resourceId, newStatus, reason = '') => {
    try {
      setProcessingId(resourceId);
      const res = await api.patch(`/admin/resources/${resourceId}/verify`, {
        status: newStatus,
        rejectionReason: reason
      });
      if (res.data.success) {
        addToast(`Resource marked as ${newStatus}`, 'success');
        fetchResources();
      }
    } catch (err) {
      addToast('Failed to update verification status', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="container" style={{ padding: '30px 20px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>
            Resource Verification Center
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Review machinery listings, verify specifications, and grant verified status
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '180px' }}
          >
            <option value="All">All Verification Statuses</option>
            <option value="PENDING_VERIFICATION">Pending Review</option>
            <option value="VERIFIED">Verified Listings</option>
            <option value="REJECTED">Rejected Listings</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading machinery listings for review..." />
      ) : resources.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No Resources in this Category"
          description="All equipment listings have been reviewed and processed."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {resources.map((res) => (
            <div
              key={res._id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '18px',
                padding: '20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <img
                  src={getEquipmentImage(res)}
                  alt=""
                  style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge badge-gray">{res.category}</span>
                    <span
                      className={
                        res.verificationStatus === 'VERIFIED'
                          ? 'badge badge-verified'
                          : res.verificationStatus === 'REJECTED'
                          ? 'badge badge-danger'
                          : 'badge badge-pending'
                      }
                    >
                      {res.verificationStatus}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                    {res.name}
                  </h3>

                  <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <span>
                      Owner: <strong>{res.owner?.name}</strong> ({res.owner?.email})
                    </span>
                    <span>
                      <MapPin size={13} style={{ display: 'inline' }} /> {res.location?.district}
                    </span>
                    <span>
                      Rate: <strong>₹{res.pricing?.price}</strong> / {res.pricing?.unit?.replace('_', ' ')}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                    Specs: {res.specs?.brand || 'Standard'} • {res.specs?.horsepower || 'High Power'} • Condition: {res.condition}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {res.verificationStatus !== 'VERIFIED' && (
                  <button
                    onClick={() => handleUpdateVerification(res._id, 'VERIFIED')}
                    disabled={processingId === res._id}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Check size={14} /> Approve & Verify
                  </button>
                )}

                {res.verificationStatus !== 'REJECTED' && (
                  <button
                    onClick={() => {
                      const reason = window.prompt('Enter rejection reason:');
                      if (reason !== null) {
                        handleUpdateVerification(res._id, 'REJECTED', reason || 'Specs incomplete');
                      }
                    }}
                    disabled={processingId === res._id}
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#dc2626', borderColor: '#fecaca', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <X size={14} /> Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminVerification;
