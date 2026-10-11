import React, { useState, useEffect } from 'react';
import { Sparkles, Tractor, ShieldCheck, MapPin, TrendingUp } from 'lucide-react';
import api from '../../services/api';
import ResourceCard from '../../components/ResourceCard';
import RequestModal from '../../components/RequestModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const AIRecommendations = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestTarget, setRequestTarget] = useState(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ai/recommendations');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating personalized farm recommendations..." minHeight="60vh" />;
  }

  const recommendations = data?.recommendations || [];
  const farmerContext = data?.farmerContext || {};

  return (
    <div className="container" style={{ padding: '30px 20px 60px' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803d', fontWeight: '700', fontSize: '12px' }}>
          <Sparkles size={16} /> MULTI-FACTOR FARM MATCHING
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
          Personalized Machinery Recommendations
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b' }}>
          Tailored to your {farmerContext.landArea} {farmerContext.landUnit} farm in {farmerContext.district} cultivating {farmerContext.crops?.join(', ')}.
        </p>
      </div>

      {/* Seasonal Insight Box */}
      {data?.seasonalTrends && (
        <div
          style={{
            padding: '16px 20px',
            borderRadius: '12px',
            background: '#fffbeb',
            border: '1px solid #fde68a',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <TrendingUp size={22} color="#d97706" />
          <div style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.5' }}>
            <strong>Seasonal Demand Insight:</strong> {data.seasonalTrends}
          </div>
        </div>
      )}

      {/* Recommendations Grid */}
      {recommendations.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No Personalized Matches Yet"
          description="Complete your farm profile with district, land area, and crops to receive tailored recommendations."
          actionText="Update Farm Profile"
          actionLink="/farmer/profile"
        />
      ) : (
        <div className="grid-3">
          {recommendations.map((rec) => (
            <ResourceCard
              key={rec.resource._id}
              resource={rec.resource}
              matchScore={rec.matchScore}
              matchReason={rec.matchReason}
              badges={rec.suitabilityBadges}
              onRequestClick={(r) => setRequestTarget(r)}
            />
          ))}
        </div>
      )}

      {/* Booking Request Modal */}
      <RequestModal
        resource={requestTarget}
        isOpen={!!requestTarget}
        onClose={() => setRequestTarget(null)}
        onSuccess={() => {}}
      />
    </div>
  );
};

export default AIRecommendations;
