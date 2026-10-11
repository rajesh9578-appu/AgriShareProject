import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle2, XCircle, Tractor, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../context/ToastContext';
import { getEquipmentImage } from '../../utils/equipmentImages';

const MyRequests = () => {
  const { addToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/resource-requests/my-requests');
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

  const handleCancel = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this equipment request?')) return;
    try {
      const res = await api.put(`/resource-requests/${requestId}/cancel`);
      if (res.data.success) {
        addToast('Request cancelled successfully', 'info');
        fetchRequests();
      }
    } catch (err) {
      addToast('Failed to cancel request', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your equipment requests..." minHeight="60vh" />;
  }

  return (
    <div className="container" style={{ padding: '30px 20px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>
            My Equipment Requests
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Track requests sent to resource owners
          </p>
        </div>
        <Link to="/search" className="btn btn-primary btn-sm">
          + Request More Equipment
        </Link>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          title="No Requests Sent Yet"
          description="You haven't requested any agricultural equipment yet. Browse verified listings to request tractors, sprayers, or harvesters."
          actionText="Search Machinery"
          actionLink="/search"
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
                gap: '16px',
                padding: '20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img
                  src={getEquipmentImage(req.resource)}
                  alt=""
                  style={{ width: '70px', height: '70px', borderRadius: '12px', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge badge-gray">{req.resource?.category}</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Owner: <strong>{req.owner?.name}</strong>
                    </span>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                    <Link to={`/resources/${req.resource?._id}`} style={{ color: '#0f172a', textDecoration: 'none' }}>
                      {req.resource?.name}
                    </Link>
                  </h3>

                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    Dates: <strong>{new Date(req.requiredStartDate).toLocaleDateString()}</strong> to{' '}
                    <strong>{new Date(req.requiredEndDate).toLocaleDateString()}</strong> ({req.durationDays} day(s))
                  </div>
                  <div style={{ fontSize: '12px', color: '#15803d', marginTop: '2px' }}>
                    Purpose: {req.purpose} (Crop: {req.crop})
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <span
                    className={
                      req.status === 'ACCEPTED'
                        ? 'badge badge-verified'
                        : req.status === 'REJECTED'
                        ? 'badge badge-danger'
                        : req.status === 'CANCELLED'
                        ? 'badge badge-gray'
                        : 'badge badge-pending'
                    }
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    {req.status}
                  </span>

                  {req.estimatedCost > 0 && (
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
                      Est: ₹{req.estimatedCost}
                    </div>
                  )}
                </div>

                {req.status === 'PENDING' && (
                  <button
                    onClick={() => handleCancel(req._id)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#dc2626', borderColor: '#fecaca' }}
                  >
                    Cancel Request
                  </button>
                )}

                {req.status === 'ACCEPTED' && (
                  <Link to="/farmer/bookings" className="btn btn-primary btn-sm">
                    View Booking
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequests;
