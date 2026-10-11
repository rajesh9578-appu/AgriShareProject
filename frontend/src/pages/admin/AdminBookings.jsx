import React, { useState, useEffect } from 'react';
import { Calendar, User, Tractor, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'All') {
        params.append('status', statusFilter);
      }
      const res = await api.get(`/admin/bookings?${params.toString()}`);
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  return (
    <div className="container" style={{ padding: '30px 20px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>
            Platform Bookings Monitor ({bookings.length})
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Comprehensive overview of all rental contracts across farmers and owners
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="All">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="ACTIVE">Active in Field</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <LoadingSpinner message="Loading platform bookings..." />
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Equipment</th>
                  <th>Farmer (Renter)</th>
                  <th>Resource Owner</th>
                  <th>Rental Dates</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td style={{ fontWeight: '700', color: '#15803d' }}>
                      {b.bookingReference}
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{b.resource?.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{b.resource?.category}</div>
                    </td>
                    <td>
                      <div>{b.farmer?.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{b.farmer?.phone}</div>
                    </td>
                    <td>
                      <div>{b.owner?.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{b.owner?.phone}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px' }}>
                        {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{b.durationDays} day(s)</div>
                    </td>
                    <td style={{ fontWeight: '800', color: '#0f172a' }}>
                      ₹{b.pricing?.totalAmount}
                    </td>
                    <td>
                      <span
                        className={
                          b.status === 'COMPLETED'
                            ? 'badge badge-verified'
                            : b.status === 'ACTIVE'
                            ? 'badge badge-active'
                            : b.status === 'CONFIRMED'
                            ? 'badge badge-active'
                            : 'badge badge-danger'
                        }
                      >
                        {b.status}
                      </span>
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

export default AdminBookings;
