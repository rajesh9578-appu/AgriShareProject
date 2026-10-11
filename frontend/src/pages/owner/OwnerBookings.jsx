import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Phone, MapPin, User, Clock, IndianRupee } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../context/ToastContext';
import { getEquipmentImage } from '../../utils/equipmentImages';

const OwnerBookings = () => {
  const { addToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/owner-bookings');
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (bookingId, status) => {
    try {
      setUpdatingId(bookingId);
      const res = await api.patch(`/bookings/${bookingId}/status`, { status });
      if (res.data.success) {
        addToast(`Booking marked as ${status}!`, 'success');
        fetchBookings();
      }
    } catch (err) {
      addToast('Failed to update booking status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your active machinery rentals..." minHeight="60vh" />;
  }

  return (
    <div className="container" style={{ padding: '30px 20px 60px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>
          Equipment Rentals & Bookings ({bookings.length})
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Track ongoing machinery rentals and mark bookings completed upon field finish
        </p>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          title="No Active Rentals"
          description="When you accept farmer requests, confirmed bookings will be tracked here."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {bookings.map((b) => (
            <div
              key={b._id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '18px',
                padding: '24px',
                borderLeft: `5px solid ${
                  b.status === 'COMPLETED' ? '#15803d' : b.status === 'ACTIVE' ? '#0284c7' : '#d97706'
                }`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <img
                  src={getEquipmentImage(b.resource)}
                  alt=""
                  style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge badge-gray">{b.resource?.category}</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#15803d' }}>
                      Ref: {b.bookingReference}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                    {b.resource?.name}
                  </h3>

                  <div style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <span>
                      <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      {new Date(b.startDate).toLocaleDateString()} to {new Date(b.endDate).toLocaleDateString()} ({b.durationDays} day(s))
                    </span>
                    <span>
                      Rented by: <strong>{b.farmer?.name}</strong> {b.farmer?.phone && `(${b.farmer.phone})`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Complete Action */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#15803d' }}>
                    ₹{b.pricing?.totalAmount}
                  </div>
                  <span
                    className={
                      b.status === 'COMPLETED'
                        ? 'badge badge-verified'
                        : b.status === 'ACTIVE'
                        ? 'badge badge-active'
                        : b.status === 'CONFIRMED'
                        ? 'badge badge-active'
                        : 'badge badge-danger'
                    }
                  >
                    {b.status}
                  </span>
                </div>

                {b.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleUpdateStatus(b._id, 'ACTIVE')}
                    disabled={updatingId === b._id}
                    className="btn btn-secondary btn-sm"
                  >
                    Mark in Field (Active)
                  </button>
                )}

                {b.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleUpdateStatus(b._id, 'COMPLETED')}
                    disabled={updatingId === b._id}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <CheckCircle2 size={14} /> Mark Completed
                  </button>
                )}

                {b.status === 'COMPLETED' && (
                  <span style={{ fontSize: '12px', color: '#15803d', fontWeight: '700' }}>
                    ✓ Rental Completed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerBookings;
