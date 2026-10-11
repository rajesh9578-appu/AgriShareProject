import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Percent, IndianRupee, Tractor, Calendar, Star, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import StatsCard from '../../components/StatsCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const OwnerIntelligence = () => {
  const [intelligence, setIntelligence] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIntel = async () => {
      try {
        setLoading(true);
        const res = await api.get('/ai/owner-intelligence');
        if (res.data.success) {
          setIntelligence(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchIntel();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Generating fleet intelligence analytics..." minHeight="60vh" />;
  }

  const overview = intelligence?.overview || {};
  const breakdown = intelligence?.resourceBreakdown || [];
  const insights = intelligence?.aiInsights || [];

  return (
    <div className="container" style={{ padding: '30px 20px 60px' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d97706', fontWeight: '700', fontSize: '12px' }}>
          <Sparkles size={16} /> FLEET PERFORMANCE & REVENUE INTELLIGENCE
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
          Machinery Performance & Optimization
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b' }}>
          Actionable metrics calculated strictly from real platform requests, completed rentals, and farmer reviews
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <StatsCard
          title="30-Day Fleet Utilization"
          value={`${overview.utilizationRate || 0}%`}
          subtitle="Active field rental days"
          icon={Percent}
          color="#15803d"
          bg="#dcfce7"
        />
        <StatsCard
          title="Total Fleet Earnings"
          value={`₹${overview.totalEarnings || 0}`}
          subtitle={`${overview.completedBookings || 0} completed rentals`}
          icon={IndianRupee}
          color="#0284c7"
          bg="#e0f2fe"
        />
        <StatsCard
          title="Total Inquiries Received"
          value={overview.totalRequests || 0}
          subtitle={`${overview.acceptedRequests || 0} accepted`}
          icon={Calendar}
          color="#d97706"
          bg="#fef3c7"
        />
        <StatsCard
          title="Average Fleet Rating"
          value={`★ ${overview.averageRating || 5.0}`}
          subtitle={`${overview.reviewsCount || 0} verified reviews`}
          icon={Star}
          color="#f59e0b"
          bg="#fffbeb"
        />
      </div>

      {/* AI Proactive Suggestions */}
      {insights.length > 0 && (
        <div className="card" style={{ marginBottom: '32px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff' }}>
          <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#22c55e" /> AI Fleet Recommendations
          </h3>

          <div className="grid-2">
            {insights.map((ins, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '16px 20px'
                }}
              >
                <div style={{ fontWeight: '700', fontSize: '14px', color: '#22c55e', marginBottom: '4px' }}>
                  {ins.title}
                </div>
                <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
                  {ins.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Machinery Breakdown Table */}
      <div className="card">
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>
          Equipment Performance Breakdown
        </h3>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Equipment Name</th>
                <th>Category</th>
                <th>Inquiries</th>
                <th>Completed Bookings</th>
                <th>Total Revenue</th>
                <th>Rate</th>
                <th>Rating</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((res) => (
                <tr key={res.id}>
                  <td style={{ fontWeight: '700', color: '#0f172a' }}>{res.name}</td>
                  <td>
                    <span className="badge badge-gray">{res.category}</span>
                  </td>
                  <td><strong>{res.requestCount}</strong></td>
                  <td>{res.bookingCount}</td>
                  <td style={{ fontWeight: '700', color: '#15803d' }}>₹{res.revenue}</td>
                  <td>₹{res.price} / {res.unit?.replace('_', ' ')}</td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontWeight: '700' }}>
                      <Star size={12} fill="#f59e0b" color="#f59e0b" /> {res.rating}
                    </span>
                  </td>
                  <td>
                    <span className={res.isAvailable ? 'badge badge-verified' : 'badge badge-danger'}>
                      {res.isAvailable ? 'Available' : 'Busy'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OwnerIntelligence;
