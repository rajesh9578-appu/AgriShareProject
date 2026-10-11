import React, { useState, useEffect } from 'react';
import { User, MapPin, Sprout, ShieldCheck, CheckCircle2, Save, Layers } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const FarmerProfile = () => {
  const { user, profile, updateProfileData } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    village: '',
    taluk: '',
    district: 'Madurai',
    state: 'Tamil Nadu',
    landArea: 2,
    landUnit: 'acres',
    soilType: 'Red Soil',
    irrigationType: 'Borewell / Well',
    cropsCultivated: ['Paddy'],
    farmingExperience: 5,
    preferredResources: ['Tractor', 'Rotavator'],
    address: ''
  });

  const soilOptions = [
    'Alluvial Soil',
    'Black Soil',
    'Red Soil',
    'Laterite Soil',
    'Clayey Loam',
    'Sandy Loam',
    'Saline Soil'
  ];

  const irrigationOptions = [
    'Drip Irrigation',
    'Borewell / Well',
    'Canal Irrigation',
    'Sprinkler',
    'Rainfed',
    'River / Tank'
  ];

  const districtOptions = [
    'Madurai',
    'Thirumangalam',
    'Thanjavur',
    'Coimbatore',
    'Salem',
    'Tiruchirappalli',
    'Dindigul',
    'Theni',
    'Virudhunagar',
    'Erode',
    'Tirunelveli'
  ];

  const cropSuggestions = [
    'Paddy (Rice)',
    'Cotton',
    'Sugarcane',
    'Maize (Corn)',
    'Groundnut',
    'Banana',
    'Tomato',
    'Turmeric',
    'Blackgram',
    'Millets'
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get('/farmers/profile');
        if (res.data.success) {
          const p = res.data.profile;
          setFormData({
            name: res.data.user?.name || user?.name || '',
            phone: res.data.user?.phone || user?.phone || '',
            village: p.village || '',
            taluk: p.taluk || '',
            district: p.district || 'Madurai',
            state: p.state || 'Tamil Nadu',
            landArea: p.landArea || 2,
            landUnit: p.landUnit || 'acres',
            soilType: p.soilType || 'Red Soil',
            irrigationType: p.irrigationType || 'Borewell / Well',
            cropsCultivated: p.cropsCultivated || ['Paddy (Rice)'],
            farmingExperience: p.farmingExperience || 5,
            preferredResources: p.preferredResources || ['Tractor'],
            address: p.location?.address || ''
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const toggleCrop = (crop) => {
    setFormData((prev) => {
      const exists = prev.cropsCultivated.includes(crop);
      const updated = exists
        ? prev.cropsCultivated.filter((c) => c !== crop)
        : [...prev.cropsCultivated, crop];
      return { ...prev, cropsCultivated: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProfileData(formData);
    } catch (err) {
      // Error handled in context
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading farm profile details..." />;
  }

  return (
    <div className="container" style={{ padding: '40px 20px 60px' }}>
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <span className="badge badge-verified" style={{ marginBottom: '8px' }}>
            <ShieldCheck size={13} /> AGRONOMIC PROFILE
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>
            Farmer Profile & Land Details
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Accurate soil, crop, and land acreage data helps the AI recommend exactly matching equipment.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Card 1: Personal & Contact */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="#15803d" /> Contact Information
            </h3>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Farm Location */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="#15803d" /> Farm Location
            </h3>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">District *</label>
                <select
                  className="form-control"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  required
                >
                  {districtOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Taluk / Block</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Madurai North / Thirumangalam"
                  value={formData.taluk}
                  onChange={(e) => setFormData({ ...formData, taluk: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Village / Locality</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Samayanallur"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Farm Address / Landmark</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Near Canal Gate, Survey No. 42"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          {/* Card 3: Land & Soil Agronomy */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sprout size={18} color="#15803d" /> Land, Soil & Irrigation Details
            </h3>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Total Land Area *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  className="form-control"
                  value={formData.landArea}
                  onChange={(e) => setFormData({ ...formData, landArea: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Land Area Unit</label>
                <select
                  className="form-control"
                  value={formData.landUnit}
                  onChange={(e) => setFormData({ ...formData, landUnit: e.target.value })}
                >
                  <option value="acres">Acres</option>
                  <option value="hectares">Hectares</option>
                  <option value="cents">Cents</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Soil Type</label>
                <select
                  className="form-control"
                  value={formData.soilType}
                  onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                >
                  {soilOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Primary Irrigation Source</label>
                <select
                  className="form-control"
                  value={formData.irrigationType}
                  onChange={(e) => setFormData({ ...formData, irrigationType: e.target.value })}
                >
                  {irrigationOptions.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Farming Experience (Years)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={formData.farmingExperience}
                onChange={(e) => setFormData({ ...formData, farmingExperience: Number(e.target.value) })}
              />
            </div>

            {/* Cultivated Crops Multi-Select */}
            <div className="form-group">
              <label className="form-label">Crops Cultivated on this Land</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                {cropSuggestions.map((crop) => {
                  const isSelected = formData.cropsCultivated.includes(crop);
                  return (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => toggleCrop(crop)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '600',
                        border: isSelected ? '2px solid #15803d' : '1px solid #cbd5e1',
                        background: isSelected ? '#dcfce7' : '#ffffff',
                        color: isSelected ? '#15803d' : '#475569',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {crop}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="submit" disabled={saving} className="btn btn-primary btn-lg">
              <Save size={18} /> {saving ? 'Saving Profile...' : 'Save Farm Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FarmerProfile;
