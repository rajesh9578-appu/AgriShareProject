import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Clock, ShieldCheck, Tractor, Calendar, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications?limit=10');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.warn('[Notification] Fetch error', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, actionUrl) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (actionUrl) {
        setIsOpen(false);
        navigate(actionUrl);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'REQUEST_RECEIVED':
      case 'REQUEST_ACCEPTED':
        return <Tractor size={16} color="#15803d" />;
      case 'BOOKING_CONFIRMED':
      case 'BOOKING_COMPLETED':
        return <Calendar size={16} color="#0284c7" />;
      case 'RESOURCE_VERIFIED':
        return <ShieldCheck size={16} color="#16a34a" />;
      case 'AI_RECOMMENDATION':
        return <Sparkles size={16} color="#d97706" />;
      default:
        return <Bell size={16} color="#64748b" />;
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          padding: '8px',
          cursor: 'pointer',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#334155'
        }}
        aria-label="Notifications"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '700',
              borderRadius: '10px',
              minWidth: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              boxShadow: '0 0 0 2px #ffffff'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '45px',
            width: '360px',
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'modalSlideUp 0.2s ease-out'
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              borderBottom: '1px solid #f1f5f9',
              background: '#f8fafc'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="badge badge-active">{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#15803d',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: '#94a3b8' }}>
                <Bell size={28} style={{ opacity: 0.4, marginBottom: '8px' }} />
                <p style={{ fontSize: '13px' }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleMarkAsRead(n._id, n.data?.actionUrl)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f8fafc',
                    cursor: 'pointer',
                    background: n.isRead ? '#ffffff' : '#f0fdf4',
                    transition: 'background 0.15s ease',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start'
                  }}
                >
                  <div
                    style={{
                      padding: '8px',
                      borderRadius: '10px',
                      background: n.isRead ? '#f1f5f9' : '#dcfce7',
                      marginTop: '2px'
                    }}
                  >
                    {getIcon(n.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: n.isRead ? '600' : '700',
                        color: '#1e293b',
                        marginBottom: '2px'
                      }}
                    >
                      {n.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                      {n.message}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#94a3b8',
                        marginTop: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Clock size={11} /> {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {!n.isRead && (
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#15803d',
                        marginTop: '6px'
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
