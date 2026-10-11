import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, RefreshCw, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOTP, resendOTP } = useAuth();
  const { addToast } = useToast();

  const email = location.state?.email || '';

  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!email) {
      addToast('Please start registration or login to verify your email.', 'warning');
      navigate('/register');
      return;
    }

    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 6) {
      addToast('Please enter the 6-digit OTP code.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOTP(email, otp.trim());
      if (res?.success) {
        navigate('/farmer/dashboard');
      }
    } catch (err) {
      // Handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      setResending(true);
      const res = await resendOTP(email, 'registration');
      if (res?.success) {
        setCooldown(60);
      }
    } catch (err) {
      // Handled in context
    } finally {
      setResending(false);
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
            background: '#dcfce7',
            color: '#15803d',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}
        >
          <KeyRound size={28} />
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
          Enter Verification Code
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
          We sent a 6-digit OTP code to: <br />
          <strong style={{ color: '#0f172a' }}>{email}</strong>
        </p>


        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              maxLength="6"
              className="form-control"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              style={{
                textAlign: 'center',
                fontSize: '28px',
                letterSpacing: '8px',
                fontWeight: '800',
                color: '#15803d',
                padding: '12px'
              }}
              autoFocus
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
          >
            {loading ? 'Verifying...' : 'Confirm & Access Account'}
          </button>
        </form>

        <div style={{ marginTop: '24px', fontSize: '13px', color: '#64748b' }}>
          Didn't receive code?{' '}
          {cooldown > 0 ? (
            <span style={{ color: '#94a3b8' }}>Resend in {cooldown}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              style={{
                background: 'none',
                border: 'none',
                color: '#15803d',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RefreshCw size={13} /> Resend OTP Code
            </button>
          )}
        </div>

        <div style={{ marginTop: '16px' }}>
          <Link to="/login" style={{ fontSize: '12px', color: '#64748b' }}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
