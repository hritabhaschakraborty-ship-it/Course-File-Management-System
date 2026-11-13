import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Calendar, ChevronDown, CheckCircle, AlertTriangle, FileText, LogOut, User } from 'lucide-react';
import api from '../services/api';

export const TopBar = ({ breadcrumbs = [] }) => {
  const { user, logout, switchWorkspace } = useAuth();
  const navigate = useNavigate();
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.get('/api/notifications');
      if (data && data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Could not fetch notifications:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (notification) => {
    if (notification.is_read) return;
    try {
      await api.put(`/api/notifications/${notification.id}/read`);
      setNotifications(current => current.map(item => (
        item.id === notification.id ? { ...item, is_read: 1 } : item
      )));
      setUnreadCount(current => Math.max(0, current - 1));
    } catch (err) {
      console.error('Could not mark notification as read:', err);
    }
  };

  const handleBackToLogin = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const returnToAdministration = async () => {
    try {
      await switchWorkspace('ADMIN');
      navigate('/admin', { replace: true });
    } catch (error) {
      console.error('Could not return to Main Administrator workspace:', error);
      alert(error.message || 'Could not return to the Main Administrator workspace.');
    }
  };

  const designation = {
    ADMIN: 'Main Administrator',
    FACULTY: 'Faculty',
    REVIEWER: 'Reviewer',
    HOD: 'Head of Department'
  }[user?.role] || user?.role || 'Institutional User';

  return (
    <header className="app-topbar">
      {/* Breadcrumbs */}
      <nav className="topbar-breadcrumbs" aria-label="Breadcrumb">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="separator">&gt;</span>}
            {idx === breadcrumbs.length - 1 ? (
              <span className="current">{crumb.label}</span>
            ) : (
              <a href={crumb.path || '#'}>{crumb.label}</a>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Right Controls */}
      <div className="topbar-right">
        {user?.baseRole === 'ADMIN' && user.role !== 'ADMIN' && (
          <button type="button" className="btn btn-outline" onClick={returnToAdministration}>
            Return to Main Administrator
          </button>
        )}

        {/* Academic Year Selector */}
        <div className="ay-selector">
          <Calendar size={14} />
          <span>AY 2026–27</span>
          <ChevronDown size={14} />
        </div>

        {/* Notifications Icon with Badge */}
        <div style={{ position: 'relative' }}>
          <button
            className="icon-btn"
            onClick={() => setShowNotifDrawer(!showNotifDrawer)}
            aria-label="Notifications"
            id="btn-topbar-notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="icon-badge">{unreadCount}</span>}
          </button>

          {/* Notifications Dropdown Drawer */}
          {showNotifDrawer && (
            <div
              style={{
                position: 'absolute',
                top: '46px',
                right: '0',
                width: '360px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 60,
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderBottom: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#f8fafc'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  Institutional Notifications
                </div>
                {unreadCount > 0 && (
                  <button
                    className="btn btn-sm btn-outline"
                    style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                    onClick={handleMarkAllRead}
                  >
                    Mark All Read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map((n, i) => (
                    <button
                      type="button"
                      key={n.id || i}
                      onClick={() => handleMarkRead(n)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        border: 0,
                        font: 'inherit',
                        cursor: n.is_read ? 'default' : 'pointer',
                        padding: '0.85rem 1rem',
                        borderBottom: '1px solid var(--border-light)',
                        backgroundColor: n.is_read ? '#ffffff' : '#f0fdf4',
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-start'
                      }}
                    >
                      {n.type === 'APPROVAL' ? (
                        <CheckCircle size={16} style={{ color: 'var(--success)', marginTop: '2px', flexShrink: 0 }} />
                      ) : n.type === 'CORRECTION' ? (
                        <AlertTriangle size={16} style={{ color: 'var(--danger)', marginTop: '2px', flexShrink: 0 }} />
                      ) : (
                        <FileText size={16} style={{ color: 'var(--info)', marginTop: '2px', flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-light)', marginTop: '4px' }}>
                          {n.course_code ? `${n.course_code} • ` : ''}{n.created_at || 'Just now'}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ width: '100%', justifyContent: 'center', borderRadius: 0 }}
                onClick={() => {
                  setShowNotifDrawer(false);
                  navigate('/notifications');
                }}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="user-profile-pill">
          <div className="user-avatar">
            <User size={17} aria-hidden="true" />
          </div>
          <div className="user-info-text">
            <div className="user-name">{designation}</div>
          </div>
        </div>

        <button
          className="btn btn-outline btn-sm"
          onClick={handleBackToLogin}
          id="btn-back-to-login"
        >
          <LogOut size={15} />
          <span>Back to Login</span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
