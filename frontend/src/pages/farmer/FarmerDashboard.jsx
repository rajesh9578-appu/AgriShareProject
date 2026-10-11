import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Tractor,
  Calendar,
  Sparkles,
  Bot,
  Bookmark,
  TrendingUp,
  MapPin,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  Repeat
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatsCard from '../../components/StatsCard';
import ResourceCard from '../../components/ResourceCard';
import RequestModal from '../../components/RequestModal';
import LoadingSpinner from '../../components/LoadingSpinner';

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, toggleOwnerMode } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiQuickQuery, setAiQuickQuery] = useState('');
  const [requestTarget, setRequestTarget] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/farmers/dashboard');
      if (res.data.success) {
        setDashboard(res.data.dashboard);
      }
    } catch (err) {
      console.error('Error fetching dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAiQuickSubmit = (e) => {
    e.preventDefault();
    if (aiQuickQuery.trim()) {
      navigate(`/ai-assistant?initialMessage=${encodeURIComponent(aiQuickQuery.trim())}`);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your farmer dashboard..." minHeight="60vh" />;
  }

  const stats = dashboard?.stats || {};
  const completion = dashboard?.profile?.completionPercentage || 40;

  return (
    <div className="container" style={{ padding: '30px 20px 60px' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
          borderRadius: '20px',
          padding: '28px 32px',
          color: '#ffffff',
          marginBottom: '30px',
          boxShadow: '0 10px 20px -5px rgba(21, 128, 61, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.5px'
              }}
            >
              USER PORTAL • RESOURCE SEEKER & PROVIDER
            </span>
            <span style={{ fontSize: '13px', color: '#bbf7d0' }}>
              📍 {dashboard?.profile?.district || 'Madurai'}, {dashboard?.profile?.state || 'Tamil Nadu'}
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff', margin: '4px 0' }}>
            Welcome back, {user?.name}! 🌾
          </h1>
          <p style={{ fontSize: '14px', color: '#dcfce7', maxWidth: '540px' }}>
            Cultivating:{' '}
            <strong>{(dashboard?.profile?.cropsCultivated || ['Paddy']).join(', ')}</strong> •{' '}
            {dashboard?.profile?.landArea || 2} {dashboard?.profile?.landUnit || 'acres'} ({dashboard?.profile?.soilType || 'Red Soil'})
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/search" className="btn btn-secondary btn-sm" style={{ background: '#ffffff', color: '#15803d', fontWeight: '700' }}>
            <Tractor size={15} /> Find Equipment (Seeker)
          </Link>
          <Link
            to="/owner/resources/new"
            className="btn btn-sm"
            style={{
              background: '#fef3c7',
              color: '#92400e',
              border: '1px solid #fde68a',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <PlusCircle size={15} /> + Add Equipment (Provider)
          </Link>
          <Link
            to="/owner/dashboard"
            className="btn btn-sm"
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.4)',
              fontWeight: '600'
            }}
          >
            My Fleet Dashboard
          </Link>
        </div>
      </div>

      {/* Dual Activity Feature Cards: Resource Seeker & Resource Provider */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ borderLeft: '4px solid #16a34a', padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#dcfce7', color: '#15803d' }}>
              <Tractor size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Resource Seeker
              </h4>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                Search, request, and book farm machinery
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
            <Link to="/search" className="btn btn-sm btn-primary" style={{ fontSize: '12px' }}>
              Search Machinery
            </Link>
            <Link to="/farmer/requests" className="btn btn-sm btn-secondary" style={{ fontSize: '12px' }}>
              My Requests
            </Link>
            <Link to="/farmer/bookings" className="btn btn-sm btn-secondary" style={{ fontSize: '12px' }}>
              Confirmed Rentals
            </Link>
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #d97706', padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#fef3c7', color: '#b45309' }}>
              <PlusCircle size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Resource Provider
              </h4>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                List, manage, and rent out your own equipment
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
            <Link to="/owner/resources/new" className="btn btn-sm" style={{ background: '#d97706', color: '#ffffff', fontSize: '12px', fontWeight: '700' }}>
              + List New Machinery
            </Link>
            <Link to="/owner/resources" className="btn btn-sm btn-secondary" style={{ fontSize: '12px' }}>
              Manage My Fleet
            </Link>
            <Link to="/owner/requests" className="btn btn-sm btn-secondary" style={{ fontSize: '12px' }}>
              Incoming Proposals
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Completion Bar if not 100% */}
      {completion < 100 && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
              <span style={{ fontWeight: '700', color: '#0f172a' }}>
                Profile Completion: {completion}%
              </span>
              <span style={{ color: '#15803d', fontWeight: '600' }}>
                Complete for better AI recommendations
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${completion}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #22c55e, #15803d)',
                  borderRadius: '4px',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
          </div>
          <Link to="/farmer/profile" className="btn btn-outline-primary btn-sm">
            Complete Profile
          </Link>
        </div>
      )}

      {/* Statistics Cards Grid */}
      <div className="grid-4" style={{ marginBottom: '30px' }}>
        <StatsCard
          title="Active Bookings"
          value={stats.activeBookingsCount || 0}
          subtitle="Confirmed machinery"
          icon={Calendar}
          color="#0284c7"
          bg="#e0f2fe"
        />
        <StatsCard
          title="Pending Requests"
          value={stats.pendingRequestsCount || 0}
          subtitle="Awaiting owner response"
          icon={Clock}
          color="#d97706"
          bg="#fef3c7"
        />
        <StatsCard
          title="Completed Rentals"
          value={stats.completedBookingsCount || 0}
          subtitle="Past operations"
          icon={CheckCircle}
          color="#15803d"
          bg="#dcfce7"
        />
        <StatsCard
          title="Saved Bookmarks"
          value={stats.savedResourcesCount || 0}
          subtitle="Shortlisted equipment"
          icon={Bookmark}
          color="#7c3aed"
          bg="#f3e8ff"
        />
      </div>

      {/* QUICK AI CONSULTATION BOX */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ background: '#15803d', padding: '6px', borderRadius: '8px' }}>
            <Bot size={20} color="#ffffff" />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>
              Quick AI Agronomy Assistant
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>
              Ask questions tailored to your {dashboard?.profile?.landArea} {dashboard?.profile?.landUnit} farm in {dashboard?.profile?.district}
            </p>
          </div>
        </div>

        <form onSubmit={handleAiQuickSubmit} style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. 'What implements do I need for paddy land preparation next week?'"
            value={aiQuickQuery}
            onChange={(e) => setAiQuickQuery(e.target.value)}
            style={{
              background: '#0f172a',
              border: '1px solid #334155',
              color: '#ffffff',
              fontSize: '14px'
            }}
          />
          <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
            <Sparkles size={16} /> Ask AI
          </button>
        </form>

        {/* Suggested Quick Prompts */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
          {[
            'Tractor required for paddy field preparation',
            'Find boom sprayer in Madurai',
            'When is the best time to rent a harvester?'
          ].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => navigate(`/ai-assistant?initialMessage=${encodeURIComponent(prompt)}`)}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#cbd5e1',
                cursor: 'pointer'
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* ACTIVE BOOKINGS & RECENT REQUESTS */}
      <div className="grid-2" style={{ marginBottom: '32px' }}>
        {/* Active Bookings Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
              Active & Upcoming Bookings
            </h3>
            <Link to="/farmer/bookings" style={{ fontSize: '13px', fontWeight: '600', color: '#15803d' }}>
              View All
            </Link>
          </div>

          {dashboard?.activeBookings?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>
              <Calendar size={32} style={{ opacity: 0.4, marginBottom: '8px' }} />
              <p style={{ fontSize: '13px' }}>No active bookings currently.</p>
              <Link to="/search" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
                Search Equipment
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dashboard.activeBookings.slice(0, 3).map((b) => (
                <div
                  key={b._id}
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
                      {b.resource?.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Ref: <strong>{b.bookingReference}</strong> • {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="badge badge-active">{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Requests Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
              Recent Equipment Requests
            </h3>
            <Link to="/farmer/requests" style={{ fontSize: '13px', fontWeight: '600', color: '#15803d' }}>
              View All
            </Link>
          </div>

          {dashboard?.recentRequests?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>
              <Clock size={32} style={{ opacity: 0.4, marginBottom: '8px' }} />
              <p style={{ fontSize: '13px' }}>No resource requests made yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dashboard.recentRequests.slice(0, 3).map((r) => (
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
                      Purpose: {r.purpose} • {r.durationDays} day(s)
                    </div>
                  </div>
                  <span
                    className={
                      r.status === 'ACCEPTED'
                        ? 'badge badge-verified'
                        : r.status === 'REJECTED'
                        ? 'badge badge-danger'
                        : 'badge badge-pending'
                    }
                  >
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI RECOMMENDATIONS CAROUSEL */}
      {dashboard?.aiRecommendations && dashboard.aiRecommendations.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803d', fontWeight: '700', fontSize: '12px' }}>
                <Sparkles size={16} /> PERSONALIZED FOR YOUR FARM
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>
                Recommended Machinery for Your Land & Crop Cycle
              </h2>
            </div>
            <Link to="/ai-recommendations" style={{ fontSize: '13px', fontWeight: '600', color: '#15803d' }}>
              View All Recommendations
            </Link>
          </div>

          <div className="grid-3">
            {dashboard.aiRecommendations.slice(0, 3).map((rec) => (
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
        </div>
      )}

      {/* Request Modal */}
      <RequestModal
        resource={requestTarget}
        isOpen={!!requestTarget}
        onClose={() => setRequestTarget(null)}
        onSuccess={() => {
          fetchDashboardData();
        }}
      />
    </div>
  );
};

export default FarmerDashboard;
