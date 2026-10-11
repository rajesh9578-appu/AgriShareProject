import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Star, Clock, Phone, MapPin } from 'lucide-react';
import api from '../../services/api';
import RatingModal from '../../components/RatingModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../context/ToastContext';
import { getEquipmentImage } from '../../utils/equipmentImages';

const MyBookings = () => {
  const { addToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingTargetBooking, setRatingTargetBooking] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/my-bookings');
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

  if (loading) {
    return <LoadingSpinner message="Loading your machinery bookings..." minHeight="60vh" />;
  }

  return (
    <div className="container" style={{ padding: '30px 20px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>
            My Confirmed Bookings
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Track active rentals and submit verified reviews after completion
          </p>
        </div>
        <Link to="/search" className="btn btn-primary btn-sm">
          Browse More Equipment
        </Link>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          title="No Confirmed Bookings Yet"
          description="When a resource owner accepts your request, a confirmed booking will appear here."
          actionText="Explore Equipment"
          actionLink="/search"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
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
                  b.status === 'COMPLETED' ? '#15803d' : b.status === 'CONFIRMED' ? '#0284c7' : '#d97706'
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
                      Owner: <strong>{b.owner?.name}</strong> {b.owner?.phone && `(${b.owner.phone})`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price, Status & Review Button */}
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

                {b.status === 'COMPLETED' && !b.farmerRatingGiven && (
                  <button
                    onClick={() => setRatingTargetBooking(b)}
                    className="btn btn-accent btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Star size={14} fill="#ffffff" /> Rate & Review
                  </button>
                )}

                {b.status === 'COMPLETED' && b.farmerRatingGiven && (
                  <span className="badge badge-verified" style={{ fontSize: '12px' }}>
                    ✓ Review Submitted
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rating Modal */}
      <RatingModal
        booking={ratingTargetBooking}
        isOpen={!!ratingTargetBooking}
        onClose={() => setRatingTargetBooking(null)}
        onSuccess={() => {
          fetchBookings();
        }}
      />
    </div>
  );
};

export default MyBookings;
