import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';
import { Bell, Check, CheckCheck } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const data = await fetchAPI('/notifications/');
      setNotifications(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetchAPI(`/notifications/${id}/read`, { method: 'PUT' });
      loadNotifications();
    } catch (err: any) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await fetchAPI('/notifications/read-all', { method: 'PUT' });
      loadNotifications();
    } catch (err: any) {
      console.error(err);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TRANSACTION': return '#10B981';
      case 'SECURITY': return '#EF4444';
      case 'SYSTEM': return '#6366F1';
      default: return '#3B82F6';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TRANSACTION': return '💸';
      case 'SECURITY': return '🔒';
      case 'SYSTEM': return '⚙️';
      default: return '🔔';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '32px', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#FFF' }}>Notifications</h1>
          <p style={{ color: '#8B95A5', marginTop: '8px' }}>
            {unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : 'Toutes les notifications sont lues'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-primary" style={{ padding: '12px 20px', fontSize: '14px' }}>
            <CheckCheck size={18} />
            Tout marquer lu
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#8B95A5' }}>Chargement...</div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#8B95A5' }}>
            <Bell size={48} color="#D1D5DB" style={{ marginBottom: '16px' }} />
            <p style={{ fontSize: '16px', fontWeight: 600 }}>Aucune notification</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>Les nouvelles notifications apparaîtront ici.</p>
          </div>
        ) : (
          notifications.map((notif, idx) => (
            <div
              key={notif.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                padding: '20px 24px',
                borderBottom: idx < notifications.length - 1 ? '1px solid #F3F4F6' : 'none',
                backgroundColor: notif.is_read ? '#FFFFFF' : '#FFFBEB',
                transition: 'background 0.2s',
                cursor: notif.is_read ? 'default' : 'pointer'
              }}
              onClick={() => !notif.is_read && markAsRead(notif.id)}
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: `${getTypeColor(notif.type)}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                flexShrink: 0
              }}>
                {getTypeIcon(notif.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: notif.is_read ? 500 : 700, fontSize: '15px' }}>{notif.title}</span>
                  <span style={{ fontSize: '12px', color: '#555E6E', whiteSpace: 'nowrap' }}>
                    {new Date(notif.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ color: '#8B95A5', fontSize: '14px', marginTop: '4px' }}>{notif.message}</p>
              </div>
              {!notif.is_read && (
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#FACC15',
                  flexShrink: 0,
                  marginTop: '6px'
                }} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
