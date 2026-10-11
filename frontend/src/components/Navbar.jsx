import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sprout,
  Search,
  Bot,
  User,
  LogOut,
  Repeat,
  PlusCircle,
  LayoutDashboard,
  Calendar,
  Layers,
  ShieldAlert,
  Menu,
  X,
  Sparkles,
  Bookmark,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, logout, toggleOwnerMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleModeSwitch = async () => {
    const isNowOwner = await toggleOwnerMode();
    if (isNowOwner) {
      navigate('/owner/dashboard');
    } else {
      navigate('/farmer/dashboard');
    }
  };

  return (
    <nav
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 900,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 6px -1px rgba(21, 128, 61, 0.3)'
            }}
          >
            <Sprout size={24} />
          </div>
          <div>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
              Agri<span style={{ color: '#15803d' }}>Share</span>
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '10px',
                fontWeight: '700',
                color: '#d97706',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginTop: '-4px'
              }}
            >
              AI Farm Network
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="desktop-nav">
          <Link
            to="/search"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: isActive('/search') ? '#15803d' : '#475569',
              background: isActive('/search') ? '#f0fdf4' : 'transparent',
              textDecoration: 'none'
            }}
          >
            <Search size={16} /> Explore Equipment
          </Link>

          <Link
            to="/ai-assistant"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: isActive('/ai-assistant') ? '#15803d' : '#475569',
              background: isActive('/ai-assistant') ? '#f0fdf4' : 'transparent',
              textDecoration: 'none'
            }}
          >
            <Bot size={16} color="#15803d" /> AI Assistant
          </Link>

          <Link
            to="/requirement-analyzer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: isActive('/requirement-analyzer') ? '#15803d' : '#475569',
              background: isActive('/requirement-analyzer') ? '#f0fdf4' : 'transparent',
              textDecoration: 'none'
            }}
          >
            <Sparkles size={16} color="#d97706" /> Stage Analyzer
          </Link>

          {user && (
            <>
              {/* User Dashboard & Fleet Links */}
              {user.role !== 'admin' && (
                <>
                  <Link
                    to="/farmer/dashboard"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: isActive('/farmer/dashboard') ? '#15803d' : '#475569',
                      background: isActive('/farmer/dashboard') ? '#f0fdf4' : 'transparent',
                      textDecoration: 'none'
                    }}
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>

                  <Link
                    to="/owner/dashboard"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: isActive('/owner/dashboard') ? '#d97706' : '#b45309',
                      background: isActive('/owner/dashboard') ? '#fef3c7' : '#fffbeb',
                      border: '1px solid #fde68a',
                      textDecoration: 'none'
                    }}
                  >
                    <Layers size={16} /> My Fleet
                  </Link>

                  <Link
                    to="/owner/resources/new"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#15803d',
                      background: '#dcfce7',
                      border: '1px solid #bbf7d0',
                      textDecoration: 'none'
                    }}
                  >
                    <PlusCircle size={16} /> + Add Equipment
                  </Link>
                </>
              )}

              {/* Admin Panel Link */}
              {user.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#dc2626',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    textDecoration: 'none'
                  }}
                >
                  <ShieldAlert size={16} /> Admin Portal
                </Link>
              )}
            </>
          )}
        </div>

        {/* Right Actions / Auth Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <>
              {/* Notification Bell */}
              <NotificationDropdown />

              {/* User Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '30px',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
                    alt={user.name}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '44px',
                      width: '230px',
                      background: '#ffffff',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
                      border: '1px solid #e2e8f0',
                      padding: '8px 0',
                      zIndex: 1000
                    }}
                  >
                    <div style={{ padding: '8px 16px', borderBottom: '1px solid #f1f5f9' }}>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{user.name}</p>
                      <p style={{ fontSize: '11px', color: '#64748b' }}>{user.email}</p>
                      <span className="badge badge-verified" style={{ marginTop: '4px', fontSize: '10px' }}>
                        {user.role.toUpperCase()}
                      </span>
                    </div>

                    <Link
                      to="/farmer/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 16px',
                        fontSize: '13px',
                        color: '#334155',
                        textDecoration: 'none'
                      }}
                    >
                      <User size={15} /> Farm Profile
                    </Link>

                    <Link
                      to="/farmer/requests"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 16px',
                        fontSize: '13px',
                        color: '#334155',
                        textDecoration: 'none'
                      }}
                    >
                      <Calendar size={15} /> My Bookings (Seeker)
                    </Link>

                    <Link
                      to="/farmer/saved"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 16px',
                        fontSize: '13px',
                        color: '#334155',
                        textDecoration: 'none'
                      }}
                    >
                      <Bookmark size={15} /> Saved Bookmarks
                    </Link>

                    {user.role !== 'admin' && (
                      <>
                        <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />
                        <Link
                          to="/owner/resources"
                          onClick={() => setUserDropdownOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '9px 16px',
                            fontSize: '13px',
                            color: '#b45309',
                            fontWeight: '600',
                            textDecoration: 'none'
                          }}
                        >
                          <Layers size={15} /> My Equipment (Provider)
                        </Link>
                        <Link
                          to="/owner/requests"
                          onClick={() => setUserDropdownOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '9px 16px',
                            fontSize: '13px',
                            color: '#334155',
                            textDecoration: 'none'
                          }}
                        >
                          <TrendingUp size={15} /> Incoming Requests
                        </Link>
                      </>
                    )}

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        fontSize: '13px',
                        color: '#dc2626',
                        background: 'none',
                        border: 'none',
                        borderTop: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register Free
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'none',
              padding: '6px'
            }}
            className="mobile-toggle"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
