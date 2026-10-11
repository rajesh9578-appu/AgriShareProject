import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck, ShieldAlert, Check, X, Phone, Mail } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

const AdminUsers = () => {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter && roleFilter !== 'All') params.append('role', roleFilter);

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleStatus = async (userId, currentActive) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/status`);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isActive: res.data.isActive } : u))
        );
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update user status';
      addToast(msg, 'error');
    }
  };

  return (
    <div className="container" style={{ padding: '30px 20px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>
            User Accounts Management ({users.length})
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Search platform farmers, resource owners, and moderators
          </p>
        </div>

        {/* Filter controls */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            className="form-control"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="All">All Roles</option>
            <option value="user">Users (Seeker & Provider)</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Search Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchUsers();
        }}
        style={{ marginBottom: '20px' }}
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, email, or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0 20px' }}>
            Search
          </button>
        </div>
      </form>

      {/* Users Table */}
      <div className="card">
        {loading ? (
          <LoadingSpinner message="Loading user accounts..." />
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Platform Capabilities</th>
                  <th>Email Verified</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.email}`}
                          alt=""
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: '700', color: '#0f172a' }}>{u.name}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                            Joined {new Date(u.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', color: '#334155' }}>{u.email}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{u.phone || '—'}</div>
                    </td>
                    <td>
                      <span
                        className={
                          u.role === 'admin'
                            ? 'badge badge-danger'
                            : 'badge badge-verified'
                        }
                      >
                        {u.role === 'admin' ? 'ADMIN' : 'USER'}
                      </span>
                    </td>
                    <td>
                      {u.role === 'admin' ? (
                        <span className="badge badge-danger">Platform Administration</span>
                      ) : (
                        <span className="badge badge-active">Seeker & Provider</span>
                      )}
                    </td>
                    <td>
                      {u.isVerified ? (
                        <span style={{ color: '#15803d', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={14} /> Verified
                        </span>
                      ) : (
                        <span style={{ color: '#dc2626', fontSize: '12px' }}>Unverified</span>
                      )}
                    </td>
                    <td>
                      <span className={u.isActive ? 'badge badge-verified' : 'badge badge-danger'}>
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(u._id, u.isActive)}
                          className={u.isActive ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
                          style={{ fontSize: '11px', padding: '4px 8px' }}
                        >
                          {u.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
