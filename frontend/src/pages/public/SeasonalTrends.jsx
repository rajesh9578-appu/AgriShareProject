import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Sparkles, AlertCircle, Layers, BarChart2 } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const SeasonalTrends = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeasonal = async () => {
      try {
        setLoading(true);
        const res = await api.get('/ai/seasonal-demand');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSeasonal();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Aggregating seasonal platform demand patterns..." minHeight="60vh" />;
  }

  const season = data?.currentSeasonInsight || {};
  const history = data?.historicalPlatformData || {};

  return (
    <div className="container" style={{ padding: '40px 20px 60px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d97706', fontWeight: '700', fontSize: '12px' }}>
            <TrendingUp size={16} /> REGIONAL AGRONOMY & PLATFORM DEMAND
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
            Seasonal Agricultural Resource Demand Analysis
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Historical platform booking analytics combined with South Indian crop calendars to help farmers plan machinery rentals ahead of peak windows.
          </p>
        </div>

        {/* Current Season Insight Card */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            border: '1px solid #fde68a',
            padding: '28px',
            marginBottom: '32px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-pending" style={{ fontSize: '12px', fontWeight: '800' }}>
              CURRENT ACTIVE SEASON: {season.seasonName}
            </span>
          </div>

          <p style={{ fontSize: '15px', color: '#78350f', lineHeight: '1.6', marginBottom: '18px' }}>
            {season.aiAnalysisNote}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: '1px solid #fde68a' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#92400e', marginBottom: '6px' }}>
                🚜 Peak Machinery in Demand:
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {season.highDemandEquipment?.map((eq) => (
                  <span key={eq} className="badge badge-verified" style={{ fontSize: '11px' }}>
                    {eq}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: '1px solid #fde68a' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#92400e', marginBottom: '6px' }}>
                🌾 Major Regional Crops:
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {season.activeCrops?.map((c) => (
                  <span key={c} className="badge badge-gray" style={{ fontSize: '11px' }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Historical Platform Booking Breakdown */}
        <div className="card" style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={18} color="#15803d" /> Platform Booking Volume by Category
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {history.categoryBookings?.map((cat) => (
              <div
                key={cat._id}
                style={{
                  padding: '12px 16px',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>
                    {cat._id}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Revenue Generated: ₹{cat.totalRevenue}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-verified" style={{ fontSize: '13px', fontWeight: '800' }}>
                    {cat.bookingCount} Bookings
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '10px',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            fontSize: '12px',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <AlertCircle size={18} color="#64748b" style={{ flexShrink: 0 }} />
          <span>{data?.disclaimer}</span>
        </div>
      </div>
    </div>
  );
};

export default SeasonalTrends;
