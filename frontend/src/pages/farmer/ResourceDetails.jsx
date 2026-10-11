import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Star,
  ShieldCheck,
  Calendar,
  User,
  Phone,
  Mail,
  Zap,
  CheckCircle2,
  Bookmark,
  Share2,
  ArrowLeft,
  Tractor
} from 'lucide-react';
import api from '../../services/api';
import RequestModal from '../../components/RequestModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getEquipmentImage } from '../../utils/equipmentImages';

const ResourceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [resource, setResource] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchResourceData = async () => {
      try {
        setLoading(true);
        const [resResponse, ratingResponse] = await Promise.all([
          api.get(`/resources/${id}`),
          api.get(`/ratings/resource/${id}`)
        ]);

        if (resResponse.data.success) {
          setResource(resResponse.data.resource);
        }
        if (ratingResponse.data.success) {
          setRatings(ratingResponse.data.ratings);
        }
      } catch (err) {
        console.error(err);
        addToast('Resource not found', 'error');
        navigate('/search');
      } finally {
        setLoading(false);
      }
    };
    fetchResourceData();
  }, [id, navigate]);

  const handleToggleSave = async () => {
    if (!user) {
      addToast('Please login to bookmark equipment', 'warning');
      return;
    }
    try {
      const res = await api.post('/saved-resources/toggle', { resourceId: id });
      if (res.data.success) {
        setIsSaved(res.data.isSaved);
        addToast(res.data.message, 'success');
      }
    } catch (err) {
      addToast('Error saving bookmark', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading equipment specifications..." minHeight="70vh" />;
  }

  if (!resource) return null;

  const photos = resource.photos?.length > 0 ? resource.photos : [
    getEquipmentImage(resource)
  ];

  return (
    <div className="container" style={{ padding: '30px 20px 60px' }}>
      {/* Back navigation */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#64748b',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} /> Back to Search Results
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '36px' }}>
        {/* Left Column: Photos & Details */}
        <div>
          {/* Main Photo Gallery */}
          <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: '16px', background: '#0f172a' }}>
            <img
              src={photos[selectedPhoto]}
              alt={resource.name}
              style={{ width: '100%', height: '380px', objectFit: 'cover' }}
            />
          </div>

          {/* Photo Thumbnails */}
          {photos.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              {photos.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhoto(idx)}
                  style={{
                    width: '70px',
                    height: '55px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: selectedPhoto === idx ? '2px solid #15803d' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}

          {/* Overview & Description */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-verified">{resource.category}</span>
              {resource.verificationStatus === 'VERIFIED' && (
                <span className="badge badge-verified">
                  <ShieldCheck size={13} /> Verified Equipment
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
              {resource.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
              <MapPin size={16} color="#15803d" />
              <span>
                {resource.location?.address ? `${resource.location.address}, ` : ''}
                {resource.location?.village ? `${resource.location.village}, ` : ''}
                <strong>{resource.location?.district}</strong>, {resource.location?.state}
              </span>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px', color: '#0f172a' }}>
              Equipment Overview
            </h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
              {resource.description}
            </p>
          </div>

          {/* Technical Specifications */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', color: '#0f172a' }}>
              Technical Specifications & Capacity
            </h3>

            <div className="grid-2" style={{ gap: '14px' }}>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Brand / Manufacturer</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                  {resource.specs?.brand || 'Standard Industrial Machinery'}
                </div>
              </div>

              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Power / Horsepower</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                  {resource.specs?.horsepower || 'High Torque PTO'}
                </div>
              </div>

              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Fuel / Power Source</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                  {resource.specs?.fuelType || 'Diesel'}
                </div>
              </div>

              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Driver / Operator Included</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: resource.specs?.withOperator ? '#15803d' : '#475569' }}>
                  {resource.specs?.withOperator ? '✓ Experienced Operator Included' : 'No Driver (Machine Only)'}
                </div>
              </div>

              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Suitable Land Area Range</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                  {resource.suitableLandSize?.min} to {resource.suitableLandSize?.max} {resource.suitableLandSize?.unit || 'acres'}
                </div>
              </div>

              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Mechanical Condition</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', textTransform: 'capitalize' }}>
                  {resource.condition} Condition
                </div>
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>Suitable Crops</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {resource.suitableCrops?.map((c) => (
                  <span key={c} className="badge badge-gray" style={{ fontSize: '12px' }}>
                    🌾 {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Verified Farmer Reviews */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                Verified Farmer Reviews ({ratings.length})
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                <span>{resource.ratingSummary?.average || 4.8} / 5.0</span>
              </div>
            </div>

            {ratings.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                No reviews yet. Be the first farmer to review this equipment after a completed booking!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {ratings.map((r) => (
                  <div
                    key={r._id}
                    style={{
                      padding: '14px',
                      borderRadius: '10px',
                      background: '#f8fafc',
                      border: '1px solid #f1f5f9'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>
                        {r.reviewer?.name}
                      </span>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>"{r.review}"</p>
                    {r.tags?.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                        {r.tags.map((t) => (
                          <span key={t} className="badge badge-verified" style={{ fontSize: '10px' }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing, Owner Info & Booking Action */}
        <div>
          <div
            className="card"
            style={{
              position: 'sticky',
              top: '90px',
              padding: '24px',
              borderRadius: '20px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Price Banner */}
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '18px', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Rental Rate</div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#15803d' }}>
                ₹{resource.pricing?.price}{' '}
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#64748b' }}>
                  / {resource.pricing?.unit?.replace('per_', '').replace('_', ' ')}
                </span>
              </div>
              {resource.pricing?.deposit > 0 && (
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  Security Deposit: ₹{resource.pricing.deposit} (Refundable upon machine return)
                </div>
              )}
            </div>

            {/* Quick Availability Status */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                background: resource.availability?.isAvailable ? '#f0fdf4' : '#fef2f2',
                color: resource.availability?.isAvailable ? '#15803d' : '#dc2626',
                fontSize: '13px',
                fontWeight: '700',
                marginBottom: '20px'
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: resource.availability?.isAvailable ? '#15803d' : '#dc2626'
                }}
              />
              {resource.availability?.isAvailable
                ? 'Ready & Available for Immediate Booking'
                : 'Currently Booked / Inactive'}
            </div>

            {/* Action Buttons */}
            <button
              onClick={() => setIsRequestModalOpen(true)}
              disabled={!resource.availability?.isAvailable}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginBottom: '10px' }}
            >
              <Calendar size={18} /> Request Equipment Booking
            </button>

            <button
              onClick={handleToggleSave}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Bookmark size={15} fill={isSaved ? '#15803d' : 'none'} />
              {isSaved ? 'Saved in Bookmarks' : 'Save for Later'}
            </button>

            {/* Owner Trust Box */}
            <div
              style={{
                marginTop: '24px',
                paddingTop: '20px',
                borderTop: '1px solid #f1f5f9'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                Resource Owner
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={resource.owner?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${resource.owner?.email}`}
                  alt=""
                  style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                    {resource.owner?.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={13} /> Verified Owner
                  </div>
                </div>
              </div>

              {resource.owner?.phone && (
                <div style={{ marginTop: '12px', fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} color="#15803d" /> {resource.owner.phone}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      <RequestModal
        resource={resource}
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={() => {
          navigate('/farmer/requests');
        }}
      />
    </div>
  );
};

export default ResourceDetails;
