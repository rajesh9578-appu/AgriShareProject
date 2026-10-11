import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Tractor,
  Plus,
  Edit,
  Trash2,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  MapPin,
  Star,
  Eye
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../context/ToastContext';
import { getEquipmentImage } from '../../utils/equipmentImages';

const MyResources = () => {
  const { addToast } = useToast();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyResources = async () => {
    try {
      setLoading(true);
      const res = await api.get('/resources/owner/my-resources');
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
    fetchMyResources();
  }, []);

  const handleToggleAvailability = async (id) => {
    try {
      const res = await api.patch(`/resources/${id}/availability`);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setResources((prev) =>
          prev.map((r) => (r._id === id ? { ...r, availability: { ...r.availability, isAvailable: res.data.isAvailable } } : r))
        );
      }
    } catch (err) {
      addToast('Failed to update availability', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from your fleet?`)) return;
    try {
      const res = await api.delete(`/resources/${id}`);
      if (res.data.success) {
        addToast('Resource deleted successfully', 'info');
        setResources((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      addToast('Failed to delete resource', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your machinery inventory..." minHeight="60vh" />;
  }

  return (
    <div className="container" style={{ padding: '30px 20px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>
            My Machinery Fleet
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Toggle availability, edit pricing, or add new equipment
          </p>
        </div>
        <Link to="/owner/resources/new" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Add Equipment
        </Link>
      </div>

      {resources.length === 0 ? (
        <EmptyState
          icon={Tractor}
          title="No Equipment Listed Yet"
          description="List your tractors, rotavators, sprayers, or pumps to connect with local farmers and earn sharing revenue."
          actionText="+ List First Machinery"
          actionLink="/owner/resources/new"
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
                  style={{ width: '85px', height: '85px', borderRadius: '12px', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge badge-gray">{res.category}</span>
                    {res.verificationStatus === 'VERIFIED' ? (
                      <span className="badge badge-verified">
                        <ShieldCheck size={12} /> Verified
                      </span>
                    ) : (
                      <span className="badge badge-pending">
                        Pending Verification
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                    {res.name}
                  </h3>

                  <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <span>
                      <MapPin size={13} style={{ display: 'inline', marginRight: '3px' }} />
                      {res.location?.district}
                    </span>
                    <span>
                      Rate: <strong style={{ color: '#15803d' }}>₹{res.pricing?.price}</strong> / {res.pricing?.unit?.replace('_', ' ')}
                    </span>
                    <span>
                      Bookings: <strong>{res.totalBookingsCount || 0}</strong>
                    </span>
                    <span>
                      Rating: ★ <strong>{res.ratingSummary?.average || 5.0}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions & Availability Switch */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Availability Toggle */}
                <button
                  onClick={() => handleToggleAvailability(res._id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: res.availability?.isAvailable ? '1px solid #bbf7d0' : '1px solid #fecaca',
                    background: res.availability?.isAvailable ? '#f0fdf4' : '#fef2f2',
                    color: res.availability?.isAvailable ? '#15803d' : '#dc2626',
                    cursor: 'pointer'
                  }}
                  title="Toggle booking availability"
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: res.availability?.isAvailable ? '#15803d' : '#dc2626'
                    }}
                  />
                  {res.availability?.isAvailable ? 'Available' : 'Disabled'}
                </button>

                <Link to={`/resources/${res._id}`} className="btn btn-secondary btn-sm" title="Preview page">
                  <Eye size={14} /> View
                </Link>

                <Link to={`/owner/resources/edit/${res._id}`} className="btn btn-secondary btn-sm">
                  <Edit size={14} /> Edit
                </Link>

                <button
                  onClick={() => handleDelete(res._id, res.name)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#dc2626', borderColor: '#fecaca' }}
                  title="Delete equipment"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyResources;
