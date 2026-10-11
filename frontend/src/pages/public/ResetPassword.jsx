import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Lock, KeyRound, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !otp || !newPassword) {
      addToast('Please fill out all fields.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      addToast('Password must be at least 6 characters.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/reset-password', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword
      });

      if (res.data.success) {
        addToast('Password reset successfully! You can now log in.', 'success');
        navigate('/login');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password.';
      addToast(msg, 'error');
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
          maxWidth: '460px',
          width: '100%',
          padding: '36px',
          borderRadius: '20px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: '#dcfce7',
              color: '#15803d',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}
          >
            <Lock size={26} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>
            Set New Password
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            Enter OTP verification code and choose a new password
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">6-Digit Reset OTP</label>
            <input
              type="text"
              className="form-control"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password (min 6 chars)</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
          >
            {loading ? 'Updating Password...' : 'Reset Password & Proceed'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/login" style={{ fontSize: '13px', color: '#64748b' }}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
