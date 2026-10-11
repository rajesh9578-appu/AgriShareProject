import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tractor, ArrowLeft, Save, Plus, Trash2, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { PHOTO_PRESETS, getEquipmentImage } from '../../utils/equipmentImages';

const AddEditResource = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Tractor',
    description: '',
    pricing: {
      price: 800,
      unit: 'per_hour',
      deposit: 0,
      isNegotiable: false
    },
    location: {
      district: profile?.district || 'Madurai',
      taluk: profile?.taluk || '',
      village: profile?.village || '',
      address: profile?.location?.address || '',
      state: 'Tamil Nadu'
    },
    specs: {
      brand: 'Mahindra',
      horsepower: '45 HP',
      fuelType: 'Diesel',
      modelYear: 2023,
      capacity: '',
      withOperator: true
    },
    suitableCrops: ['Paddy (Rice)', 'Sugarcane', 'Cotton', 'All Crops'],
    suitableLandSize: {
      min: 1.0,
      max: 25.0,
      unit: 'acres'
    },
    usageType: 'equipment_with_operator',
    condition: 'excellent',
    photos: [
      'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80'
    ]
  });

  const categories = [
    'Tractor',
    'Rotavator',
    'Combine Harvester',
    'Sprayer',
    'Seed Drill',
    'Drip Irrigation Equipment',
    'Water Pump',
    'Agricultural Transport',
    'Storage Space'
  ];

  const photoPresets = PHOTO_PRESETS;

  useEffect(() => {
    if (isEditMode) {
      const fetchResource = async () => {
        try {
          setLoading(true);
          const res = await api.get(`/resources/${id}`);
          if (res.data.success) {
            const r = res.data.resource;
            setFormData({
              name: r.name,
              category: r.category,
              description: r.description,
              pricing: {
                price: r.pricing?.price || 500,
                unit: r.pricing?.unit || 'per_day',
                deposit: r.pricing?.deposit || 0,
                isNegotiable: !!r.pricing?.isNegotiable
              },
              location: {
                district: r.location?.district || 'Madurai',
                taluk: r.location?.taluk || '',
                village: r.location?.village || '',
                address: r.location?.address || '',
                state: r.location?.state || 'Tamil Nadu'
              },
              specs: {
                brand: r.specs?.brand || '',
                horsepower: r.specs?.horsepower || '',
                fuelType: r.specs?.fuelType || 'Diesel',
                modelYear: r.specs?.modelYear || 2023,
                capacity: r.specs?.capacity || '',
                withOperator: !!r.specs?.withOperator
              },
              suitableCrops: r.suitableCrops || ['All Crops'],
              suitableLandSize: r.suitableLandSize || { min: 1, max: 25, unit: 'acres' },
              usageType: r.usageType || 'rental',
              condition: r.condition || 'good',
              photos: r.photos?.length > 0 ? r.photos : [photoPresets[0].url]
            });
          }
        } catch (err) {
          addToast('Failed to load resource for editing', 'error');
          navigate('/owner/resources');
        } finally {
          setLoading(false);
        }
      };
      fetchResource();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      addToast('Please fill out all required fields.', 'error');
      return;
    }

    try {
      setSaving(true);
      if (isEditMode) {
        const res = await api.put(`/resources/${id}`, formData);
        if (res.data.success) {
          addToast('Resource updated successfully!', 'success');
          navigate('/owner/resources');
        }
      } else {
        const res = await api.post('/resources', formData);
        if (res.data.success) {
          addToast('Machinery listed on platform successfully!', 'success');
          navigate('/owner/resources');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error saving resource.';
      addToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading equipment configuration..." />;
  }

  return (
    <div className="container" style={{ padding: '30px 20px 60px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
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
            cursor: 'pointer',
            marginBottom: '16px'
          }}
        >
          <ArrowLeft size={16} /> Back to Inventory
        </button>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>
            {isEditMode ? 'Edit Equipment Listing' : 'List Agricultural Machinery for Sharing'}
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Fill accurate specifications, pricing, and operating conditions for farmer discovery
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Section 1: Basic Info */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', color: '#0f172a' }}>
              1. Basic Information & Category
            </h3>

            <div className="form-group">
              <label className="form-label">Equipment Name / Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Mahindra 575 DI 45HP Tractor with 48-Blade Rotavator"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => {
                    const newCat = e.target.value;
                    const defaultPhoto = getEquipmentImage(newCat, formData.name);
                    setFormData((prev) => ({
                      ...prev,
                      category: newCat,
                      photos: [defaultPhoto]
                    }));
                  }}
                  required
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Machinery Condition *</label>
                <select
                  className="form-control"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                >
                  <option value="excellent">Excellent (Like New / Maintained)</option>
                  <option value="good">Good (Normal Working Condition)</option>
                  <option value="fair">Fair (Operable)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Description *</label>
              <textarea
                className="form-control"
                placeholder="Describe attachments, suitable field operations, fuel requirements, maintenance state, and terms..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>
          </div>

          {/* Section 2: Pricing & Terms */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', color: '#0f172a' }}>
              2. Rental Pricing & Commercials
            </h3>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Rental Price (₹) *</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={formData.pricing.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricing: { ...formData.pricing, price: Number(e.target.value) }
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Billing Unit *</label>
                <select
                  className="form-control"
                  value={formData.pricing.unit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricing: { ...formData.pricing, unit: e.target.value }
                    })
                  }
                >
                  <option value="per_hour">Per Hour</option>
                  <option value="per_day">Per Day</option>
                  <option value="per_acre">Per Acre</option>
                  <option value="per_trip">Per Trip</option>
                  <option value="fixed">Fixed Rate</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Refundable Security Deposit (₹)</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={formData.pricing.deposit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricing: { ...formData.pricing, deposit: Number(e.target.value) }
                    })
                  }
                />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '28px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={formData.pricing.isNegotiable}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pricing: { ...formData.pricing, isNegotiable: e.target.checked }
                      })
                    }
                    style={{ width: '16px', height: '16px', accentColor: '#15803d' }}
                  />
                  Price is Negotiable for multi-day rentals
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Technical Specs */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', color: '#0f172a' }}>
              3. Specifications & Operator
            </h3>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Brand / Make</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Mahindra, Kubota, John Deere, Shaktiman"
                  value={formData.specs.brand}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specs: { ...formData.specs, brand: e.target.value }
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Horsepower / Rating</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 45 HP / 55 HP / 5 HP Pump"
                  value={formData.specs.horsepower}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specs: { ...formData.specs, horsepower: e.target.value }
                    })
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: '#15803d' }}>
                <input
                  type="checkbox"
                  checked={formData.specs.withOperator}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specs: { ...formData.specs, withOperator: e.target.checked }
                    })
                  }
                  style={{ width: '18px', height: '18px', accentColor: '#15803d' }}
                />
                Skilled Driver / Operator Included with Equipment
              </label>
            </div>
          </div>

          {/* Section 4: Photo Selection */}
          <div className="card" style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '12px', color: '#0f172a' }}>
              4. Photos & Preset Showcase
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
              Select a realistic preset image or enter image URL:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', marginBottom: '16px' }}>
              {photoPresets.map((preset) => (
                <div
                  key={preset.label}
                  onClick={() => setFormData({ ...formData, photos: [preset.url] })}
                  style={{
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: formData.photos[0] === preset.url ? '3px solid #15803d' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <img src={preset.url} alt={preset.label} style={{ width: '100%', height: '65px', objectFit: 'cover' }} />
                  <div style={{ fontSize: '10px', padding: '4px', textAlign: 'center', background: '#f8fafc', fontWeight: '600' }}>
                    {preset.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">Custom Image URL</label>
              <input
                type="url"
                className="form-control"
                value={formData.photos[0] || ''}
                onChange={(e) => setFormData({ ...formData, photos: [e.target.value] })}
              />
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={() => navigate('/owner/resources')} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary btn-lg">
              <Save size={18} /> {saving ? 'Saving Equipment...' : isEditMode ? 'Update Equipment' : 'List Equipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditResource;
