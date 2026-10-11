import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      addToast('Please fill out all required fields.', 'error');
      return;
    }

    if (formData.password.length < 6) {
      addToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await register(formData);
      if (res.success) {
        navigate('/verify-otp', {
          state: {
            email: res.email
          }
        });
      }
    } catch (err) {
      // Handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        background: '#f8fafc'
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '36px',
          borderRadius: '20px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              marginBottom: '12px'
            }}
          >
            <Sprout size={28} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>
            Create Your AgriShare Account
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            Join thousands of farmers sharing agricultural machinery
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <CheckCircle2 size={18} color="#15803d" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '12px', color: '#166534', lineHeight: '1.4' }}>
              <strong>Universal User Account:</strong> You can search & rent equipment (Resource Seeker) and list & share your machinery (Resource Provider) with one account.
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Ramesh Kumar"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-control"
              placeholder="ramesh@farm.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <input
              type="tel"
              className="form-control"
              placeholder="+91 98401 23456"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Create Password * (min 6 chars)</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
          >
            {loading ? 'Sending OTP...' : 'Send Verification OTP'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#64748b' }}>
          Already registered?{' '}
          <Link to="/login" style={{ fontWeight: '700', color: '#15803d' }}>
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
