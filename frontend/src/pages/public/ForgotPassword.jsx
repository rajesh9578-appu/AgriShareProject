import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Mail, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      if (res.data.success) {
        addToast(res.data.message, 'success');
        navigate('/reset-password', {
          state: {
            email: email.trim()
          }
        });
      }
    } catch (err) {
      addToast('Error sending reset OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '80vh',
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
          maxWidth: '440px',
          width: '100%',
          padding: '36px',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08)'
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: '#fef3c7',
            color: '#d97706',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}
        >
          <KeyRound size={28} />
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
          Reset Account Password
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
          Enter your registered email and we will send a password reset OTP.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="farmer@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
          >
            {loading ? 'Sending Code...' : 'Send Reset Code'}
          </button>
        </form>

        <div style={{ marginTop: '20px' }}>
          <Link
            to="/login"
            style={{ fontSize: '13px', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
