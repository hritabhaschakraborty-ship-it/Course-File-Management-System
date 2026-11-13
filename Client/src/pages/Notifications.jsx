import React, { useCallback, useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import api from '../services/api';
import { Bell, CheckCircle2 } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNotifications = useCallback(async () => {
    try {
      setError('');
      const data = await api.get('/api/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      setError(err.message || 'Could not load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markRead = async (notification) => {
    if (notification.is_read) return;
    try {
      await api.put(`/api/notifications/${notification.id}/read`);
      setNotifications(current => current.map(item => (
        item.id === notification.id ? { ...item, is_read: 1 } : item
      )));
      setUnreadCount(current => Math.max(0, current - 1));
    } catch (err) {
      setError(err.message || 'Could not mark notification as read.');
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      setNotifications(current => current.map(item => ({ ...item, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) {
      setError(err.message || 'Could not mark notifications as read.');
    }
  };

  return (
    <AppLayout breadcrumbs={[{ label: 'Notifications' }]}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h1 className="page-title">Notifications</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button type="button" className="btn btn-outline btn-sm" onClick={markAllRead}>
            <CheckCircle2 size={15} /> Mark all as read
          </button>
        )}
      </div>

      {error && <div className="card" role="alert" style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}

      <div className="card">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            <Bell size={24} style={{ marginBottom: '0.5rem' }} />
            <div>No notifications yet.</div>
          </div>
        ) : notifications.map(notification => (
          <article
            key={notification.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '1rem',
              padding: '1rem',
              borderBottom: '1px solid var(--border-light)',
              background: notification.is_read ? '#fff' : 'var(--primary-light)'
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{notification.title}</div>
              <p style={{ margin: '0.35rem 0', color: 'var(--text-secondary)' }}>{notification.message}</p>
              <small style={{ color: 'var(--text-muted)' }}>
                {[notification.course_code, notification.created_at].filter(Boolean).join(' • ')}
              </small>
            </div>
            {!notification.is_read && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => markRead(notification)}
                aria-label={`Mark ${notification.title} as read`}
              >
                Mark as read
              </button>
            )}
          </article>
        ))}
      </div>
    </AppLayout>
  );
};

export default Notifications;
