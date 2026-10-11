import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Sprout, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email.trim(), password);

      if (res?.isUnverified) {
        navigate('/verify-otp', { state: { email: res.email } });
        return;
      }

      if (res?.user) {
        addToast(`Welcome back, ${res.user.name}!`, 'success');
        if (res.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/farmer/dashboard');
        }
      }
    } catch (err) {
      // Handled in auth context toast
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
        background: 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 50%, #eff6ff 100%)'
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '460px',
          width: '100%',
          padding: '36px',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.12)',
          border: '1px solid #e2e8f0',
          background: '#ffffff'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 10px 15px -3px rgba(22, 163, 74, 0.3)',
              marginBottom: '14px'
            }}
          >
            <Sprout size={32} />
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
            Sign In to AgriShare
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px' }}>
            Access your agricultural machinery, requests, and smart dashboard
          </p>
        </div>

        {/* Main Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label className="form-label" style={{ fontWeight: '600', color: '#334155', fontSize: '13px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }}
              >
                <Mail size={18} />
              </div>
              <input
                type="email"
                className="form-control"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '40px', height: '46px', fontSize: '14px' }}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ fontWeight: '600', color: '#334155', fontSize: '13px', margin: 0 }}>
                Password
              </label>
              <Link to="/forgot-password" style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600', textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }}
              >
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '40px', paddingRight: '40px', height: '46px', fontSize: '14px' }}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              height: '46px',
              fontSize: '15px',
              fontWeight: '700',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'} <ArrowRight size={18} />
          </button>
        </form>

        {/* Footer Link to Register */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ fontWeight: '700', color: '#16a34a', textDecoration: 'none' }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
