import React, { useState } from 'react';
import { Sparkles, Tractor, CheckCircle2, ShieldCheck, ArrowRight, Layers, HelpCircle } from 'lucide-react';
import api from '../../services/api';
import ResourceCard from '../../components/ResourceCard';
import RequestModal from '../../components/RequestModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const AIRequirementAnalyzer = () => {
  const { profile } = useAuth();
  const { addToast } = useToast();

  const [crop, setCrop] = useState(profile?.cropsCultivated?.[0] || 'Paddy (Rice)');
  const [landSize, setLandSize] = useState(profile?.landArea || 2.0);
  const [landUnit, setLandUnit] = useState(profile?.landUnit || 'acres');
  const [farmingStage, setFarmingStage] = useState('Land Preparation');
  const [district, setDistrict] = useState(profile?.district || 'Madurai');
  const [currentRequirement, setCurrentRequirement] = useState('');

  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [requestTarget, setRequestTarget] = useState(null);

  const stageOptions = [
    { value: 'Land Preparation', label: '1. Land Preparation & Plowing (Tillage, leveling, puddling)' },
    { value: 'Sowing / Planting', label: '2. Sowing & Planting (Direct seeding, mat transplanter)' },
    { value: 'Crop Care / Weeding', label: '3. Crop Protection & Care (Weeding, spraying, fertigation)' },
    { value: 'Harvesting / Threshing', label: '4. Harvesting & Threshing (Combine harvester, reaper)' },
    { value: 'Post-Harvest & Transport', label: '5. Post-Harvest & Haulage (Trolley, storage, drying)' }
  ];

  const handleAnalyze = async (e) => {
    e.preventDefault();
    try {
      setAnalyzing(true);
      const res = await api.post('/ai/requirement-analyzer', {
        crop,
        landSize: Number(landSize),
        landUnit,
        farmingStage,
        currentRequirement,
        district
      });

      if (res.data.success) {
        setResult(res.data);
        addToast('Agricultural requirements analyzed successfully!', 'success');
      }
    } catch (err) {
      addToast('Error analyzing requirement', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px 60px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Title Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="badge badge-verified" style={{ marginBottom: '10px' }}>
            <Sparkles size={14} /> AI STAGE & MACHINERY ANALYZER
          </span>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
            AI Agricultural Requirement Analyzer
          </h1>
          <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '650px', margin: '0 auto' }}>
            Enter your crop, farm acreage, and current farming stage. The AI will determine the optimal machinery categories and immediately query the live platform database for available equipment.
          </p>
        </div>

        {/* Input Form Card */}
        <div className="card" style={{ padding: '32px', marginBottom: '40px' }}>
          <form onSubmit={handleAnalyze}>
            <div className="grid-3" style={{ marginBottom: '18px' }}>
              <div className="form-group">
                <label className="form-label">Crop Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Paddy (Rice), Cotton, Sugarcane"
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Land Area *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    className="form-control"
                    value={landSize}
                    onChange={(e) => setLandSize(e.target.value)}
                    required
                  />
                  <select
                    className="form-control"
                    style={{ width: '100px' }}
                    value={landUnit}
                    onChange={(e) => setLandUnit(e.target.value)}
                  >
                    <option value="acres">Acres</option>
                    <option value="hectares">Hectares</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">District / Location *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Madurai, Thirumangalam"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label className="form-label">Current Farming Stage *</label>
              <select
                className="form-control"
                value={farmingStage}
                onChange={(e) => setFarmingStage(e.target.value)}
              >
                {stageOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Specific Requirement / Field Condition (Optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Clayey soil with 2 inches standing water, need quick 2-day turnaround"
                value={currentRequirement}
                onChange={(e) => setCurrentRequirement(e.target.value)}
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                type="submit"
                disabled={analyzing}
                className="btn btn-primary btn-lg"
                style={{ minWidth: '240px' }}
              >
                {analyzing ? (
                  'Analyzing Agronomy & Database...'
                ) : (
                  <>
                    <Sparkles size={18} /> Analyze Requirement & Find Machinery
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* RESULTS SECTION */}
        {result && (
          <div style={{ animation: 'modalSlideUp 0.3s ease-out' }}>
            {/* 1. AI Analysis & Suggestions Banner */}
            <div
              className="card"
              style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                border: '1px solid #bbf7d0',
                padding: '28px',
                marginBottom: '32px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span className="badge badge-verified" style={{ fontSize: '12px' }}>
                  <Sparkles size={13} /> AI AGRONOMIC STAGE INSIGHTS
                </span>
                <span style={{ fontSize: '13px', color: '#166534', fontWeight: '700' }}>
                  ({result.input?.crop} • {result.input?.farmingStage})
                </span>
              </div>

              <p style={{ fontSize: '15px', color: '#14532d', lineHeight: '1.6', marginBottom: '16px' }}>
                {result.aiAnalysis?.stageSummary}
              </p>

              {/* Recommended Capacity */}
              {result.aiAnalysis?.recommendedCapacity && (
                <div style={{ padding: '10px 14px', background: '#ffffff', borderRadius: '8px', border: '1px solid #bbf7d0', marginBottom: '16px', fontSize: '13px', color: '#15803d' }}>
                  ⚡ <strong>Optimal Equipment Power:</strong> {result.aiAnalysis.recommendedCapacity}
                </div>
              )}

              {/* Identified Categories */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#166534', marginBottom: '8px' }}>
                  Required Machinery Categories Identified:
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {result.aiAnalysis?.suggestedCategories?.map((cat, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        background: '#15803d',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: '700'
                      }}
                    >
                      🚜 {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Agronomic Tips */}
              {result.aiAnalysis?.agronomicTips && result.aiAnalysis.agronomicTips.length > 0 && (
                <div style={{ borderTop: '1px solid #bbf7d0', paddingTop: '12px', fontSize: '13px', color: '#166534' }}>
                  <strong>Agronomy Field Tips:</strong>
                  <ul style={{ paddingLeft: '20px', marginTop: '6px' }}>
                    {result.aiAnalysis.agronomicTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 2. Actual Live Database Candidate Matches */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>
                    Actual Platform Database Matches ({result.totalPlatformMatches})
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Real available listings in {result.input?.district} matching the identified categories
                  </p>
                </div>
              </div>

              {result.actualDatabaseResources?.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  <Tractor size={36} style={{ opacity: 0.4, marginBottom: '8px' }} />
                  <p style={{ fontSize: '14px' }}>
                    No verified listings currently found in the platform database for these exact categories in {result.input?.district}.
                  </p>
                </div>
              ) : (
                <div className="grid-3">
                  {result.actualDatabaseResources.map((res) => (
                    <ResourceCard
                      key={res._id}
                      resource={res}
                      matchReason={res.matchReason}
                      onRequestClick={(r) => setRequestTarget(r)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Request Modal */}
        <RequestModal
          resource={requestTarget}
          isOpen={!!requestTarget}
          onClose={() => setRequestTarget(null)}
          onSuccess={() => {}}
        />
      </div>
    </div>
  );
};

export default AIRequirementAnalyzer;
