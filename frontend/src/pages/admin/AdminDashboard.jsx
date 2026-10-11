import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Tractor,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Layers,
  Activity,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import api from '../../services/api';
import StatsCard from '../../components/StatsCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setData(res.data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading platform administrative analytics..." minHeight="60vh" />;
  }

  const stats = data || {};

  return (
    <div className="container" style={{ padding: '30px 20px 60px' }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
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
              background: '#dc2626',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '700'
            }}
          >
            ADMINISTRATIVE PORTAL
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '6px 0 4px', color: '#ffffff' }}>
            Platform Overview & Moderation
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>
            Monitor users, verify machinery listings, configure taxonomies, and track platform metrics
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/admin/verification" className="btn btn-primary btn-sm">
            <ShieldCheck size={16} /> Verification Center ({stats.pendingResources || 0})
          </Link>
          <Link to="/admin/users" className="btn btn-secondary btn-sm" style={{ background: '#334155', color: '#ffffff', border: '1px solid #475569' }}>
            <Users size={16} /> Manage Users
          </Link>
        </div>
      </div>

      {/* Core KPI Metrics */}
      <div className="grid-4" style={{ marginBottom: '30px' }}>
        <StatsCard
          title="Platform Users"
          value={stats.totalRegularUsers ?? stats.totalUsers ?? 0}
          subtitle="Seekers & Providers"
          icon={Users}
          color="#15803d"
          bg="#dcfce7"
        />
        <StatsCard
          title="Equipment Listings"
          value={stats.totalResources || 0}
          subtitle={`${stats.verifiedResources || 0} verified`}
          icon={Tractor}
          color="#d97706"
          bg="#fef3c7"
        />
        <StatsCard
          title="Pending Verification"
          value={stats.pendingResources || 0}
          subtitle="Requires admin review"
          icon={Clock}
          color="#dc2626"
          bg="#fef2f2"
        />
        <StatsCard
          title="Total Bookings"
          value={stats.totalBookings || 0}
          subtitle={`${stats.completedBookings || 0} completed`}
          icon={Calendar}
          color="#0284c7"
          bg="#e0f2fe"
        />
      </div>

      {/* Popular Categories & Popular Locations */}
      <div className="grid-2" style={{ marginBottom: '32px' }}>
        {/* Popular Categories */}
        <div className="card">
          <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#15803d" /> Machinery by Category
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stats.categoryStats?.map((cat) => (
              <div
                key={cat._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <span style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>
                  {cat._id}
                </span>
                <span className="badge badge-verified" style={{ fontWeight: '800' }}>
                  {cat.count} listings
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Districts */}
        <div className="card">
          <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} color="#0284c7" /> Equipment Distribution by District
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stats.locationStats?.map((loc) => (
              <div
                key={loc._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <span style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>
                  {loc._id || 'Unspecified'}
                </span>
                <span className="badge badge-active" style={{ fontWeight: '800' }}>
                  {loc.count} listings
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Stream */}
      <div className="card">
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="#d97706" /> Platform Activity Logs
        </h3>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Event Type</th>
                <th>Category</th>
                <th>District / Hub</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentActivities?.map((act) => (
                <tr key={act._id}>
                  <td>
                    <span className="badge badge-gray" style={{ fontWeight: '700' }}>
                      {act.action}
                    </span>
                  </td>
                  <td>{act.category || 'General'}</td>
                  <td>{act.district || 'Tamil Nadu'}</td>
                  <td style={{ fontSize: '12px', color: '#64748b' }}>
                    {new Date(act.createdAt).toLocaleDateString()} {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

export default AdminDashboard;
