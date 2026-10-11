import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Tractor,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ShieldCheck,
  Percent,
  IndianRupee
} from 'lucide-react';
import api from '../../services/api';
import StatsCard from '../../components/StatsCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { getEquipmentImage } from '../../utils/equipmentImages';

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [intelligence, setIntelligence] = useState(null);
  const [resources, setResources] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOwnerData = async () => {
    try {
      setLoading(true);
      const [intelRes, resRes, reqRes] = await Promise.all([
        api.get('/ai/owner-intelligence'),
        api.get('/resources/owner/my-resources'),
        api.get('/resource-requests/owner-requests')
      ]);

      if (intelRes.data.success) setIntelligence(intelRes.data);
      if (resRes.data.success) setResources(resRes.data.resources);
      if (reqRes.data.success) {
        setPendingRequests(reqRes.data.requests.filter((r) => r.status === 'PENDING'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your machinery fleet intelligence..." minHeight="60vh" />;
  }

  const overview = intelligence?.overview || {};
  const insights = intelligence?.aiInsights || [];

  return (
    <div className="container" style={{ padding: '30px 20px 60px' }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
          borderRadius: '20px',
          padding: '28px 32px',
          color: '#ffffff',
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <span
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '700'
            }}
          >
            RESOURCE PROVIDER • FLEET MANAGEMENT
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '6px 0 4px' }}>
            Fleet Management & Intelligence
          </h1>
          <p style={{ fontSize: '14px', color: '#fef3c7' }}>
            Manage machinery inventory, respond to rental proposals, and monitor earnings.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            to="/farmer/dashboard"
            className="btn btn-sm"
            style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            🌾 Seeker Hub
          </Link>
          <Link
            to="/owner/resources/new"
            className="btn btn-secondary btn-sm"
            style={{ background: '#ffffff', color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}
          >
            <PlusCircle size={16} /> List New Equipment
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid-4" style={{ marginBottom: '30px' }}>
        <StatsCard
          title="Fleet Size"
          value={overview.totalResources || 0}
          subtitle={`${overview.availableResources || 0} active & available`}
          icon={Tractor}
          color="#d97706"
          bg="#fef3c7"
        />
        <StatsCard
          title="Pending Requests"
          value={pendingRequests.length}
          subtitle="Awaiting your approval"
          icon={Clock}
          color="#dc2626"
          bg="#fef2f2"
        />
        <StatsCard
          title="30-Day Utilization"
          value={`${overview.utilizationRate || 0}%`}
          subtitle="Days booked vs available"
          icon={Percent}
          color="#15803d"
          bg="#dcfce7"
        />
        <StatsCard
          title="Total Sharing Earnings"
          value={`₹${overview.totalEarnings || 0}`}
          subtitle={`Across ${overview.completedBookings || 0} completed rentals`}
          icon={IndianRupee}
          color="#0284c7"
          bg="#e0f2fe"
        />
      </div>

      {/* AI FLEET INSIGHTS BANNER */}
      {insights.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#15803d', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} /> PROACTIVE FLEET INTELLIGENCE
          </div>
          <div className="grid-2">
            {insights.map((ins, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  background: ins.type === 'DEMAND_ALERT' ? '#fffbeb' : '#f0fdf4',
                  border: `1px solid ${ins.type === 'DEMAND_ALERT' ? '#fde68a' : '#bbf7d0'}`,
                  padding: '18px 22px'
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                  {ins.title || 'Fleet Suggestion'}
                </div>
                <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                  {ins.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUICK PENDING REQUESTS & INVENTORY */}
      <div className="grid-2">
        {/* Pending Requests */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
              Pending Farmer Requests ({pendingRequests.length})
            </h3>
            <Link to="/owner/requests" style={{ fontSize: '13px', fontWeight: '600', color: '#15803d' }}>
              View All
            </Link>
          </div>

          {pendingRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
              <CheckCircle2 size={32} style={{ opacity: 0.4, marginBottom: '6px' }} />
              <p style={{ fontSize: '13px' }}>All incoming requests responded to!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingRequests.slice(0, 3).map((r) => (
                <div
                  key={r._id}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                      {r.resource?.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Farmer: <strong>{r.farmer?.name}</strong> • {r.durationDays} day(s) from {new Date(r.requiredStartDate).toLocaleDateString()}
                    </div>
                  </div>
                  <Link to="/owner/requests" className="btn btn-primary btn-sm">
                    Review Request
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fleet Inventory Summary */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
              Listed Equipment ({resources.length})
            </h3>
            <Link to="/owner/resources" style={{ fontSize: '13px', fontWeight: '600', color: '#15803d' }}>
              Manage Fleet
            </Link>
          </div>

          {resources.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
              <Tractor size={32} style={{ opacity: 0.4, marginBottom: '6px' }} />
              <p style={{ fontSize: '13px' }}>No machinery listed yet.</p>
              <Link to="/owner/resources/new" className="btn btn-primary btn-sm" style={{ marginTop: '10px' }}>
                + Add Equipment
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {resources.slice(0, 4).map((res) => (
                <div
                  key={res._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={getEquipmentImage(res)}
                      alt=""
                      style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                        {res.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        ₹{res.pricing?.price} / {res.pricing?.unit?.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                  <span className={res.availability?.isAvailable ? 'badge badge-verified' : 'badge badge-danger'}>
                    {res.availability?.isAvailable ? 'Available' : 'Busy'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
