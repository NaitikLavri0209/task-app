import { useEffect, useState } from 'react';
import { api } from '../api.js';

// Polls the EventEmitter-backed notification endpoint every 10s
export default function NotificationBell() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = () => api('/notifications').then((d) => alive && setItems(d)).catch(() => {});
    load();
    const t = setInterval(load, 10000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  const unread = items.filter((n) => !n.read).length;
  const toggle = async () => {
    setOpen(!open);
    if (!open && unread) { await api('/notifications/read', { method: 'POST' }).catch(() => {}); setItems(items.map((n) => ({ ...n, read: true }))); }
  };

  return (
    <div className="bell">
      <button onClick={toggle} aria-label="Notifications">🔔{unread > 0 && <b className="badge">{unread}</b>}</button>
      {open && (
        <div className="dropdown">
          {items.length === 0 ? <p className="muted">No notifications</p> : items.map((n) => (
            <div key={n.id} className={`note ${n.type}`}>{n.message}<small>{new Date(n.createdAt).toLocaleTimeString()}</small></div>
          ))}
        </div>
      )}
    </div>
  );
}
