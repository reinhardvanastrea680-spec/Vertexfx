import { useState, useEffect, useRef } from "react";
import { usersApi } from "./api";

export default function NotificationsBell({ colors }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function loadNotifications() {
    try {
      const data = await usersApi.getNotifications(1);
      setNotifications(data.items || []);
      setUnread(data.unread || 0);
    } catch (err) {
      // Silent fail for notifications
    }
  }

  async function markRead(id) {
    try {
      await usersApi.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
      setUnread((prev) => Math.max(0, prev - 1));
    } catch (err) { /* silent */ }
  }

  async function markAllRead() {
    try {
      await usersApi.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
    } catch (err) { /* silent */ }
  }

  const typeIcons = {
    trade_opened: "▲", trade_closed: "▽", deposit_received: "↓",
    withdrawal_approved: "↑", kyc_approved: "✓", kyc_rejected: "✗",
    margin_call: "!", default: "○",
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{
        background: "transparent", border: `1px solid ${colors.BORDER}`, color: colors.LIGHT,
        padding: "9px 14px", borderRadius: 6, cursor: "pointer", fontSize: 14, position: "relative",
      }}>
        ○
        {unread > 0 && (
          <span style={{
            position: "absolute", top: -6, right: -6, background: colors.RED,
            color: "#fff", fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
            width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          }}>{unread > 9 ? "9+" : unread}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: 48, right: 0, width: 360, maxHeight: 480,
          background: colors.NAVY, border: `1px solid ${colors.BORDER}`, borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)", zIndex: 1001, overflow: "hidden",
        }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${colors.BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: colors.LIGHT, fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700 }}>Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ background: "transparent", border: "none", color: colors.GOLD, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600 }}>
                Mark all read
              </button>
            )}
          </div>
          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 16px" }}>
                <span style={{ fontSize: 32, display: "block", marginBottom: 8, color: colors.MUTED }}>○</span>
                <p style={{ color: colors.MUTED, fontFamily: "'DM Sans', sans-serif", fontSize: 13, margin: 0 }}>No notifications yet</p>
              </div>
            ) : notifications.map((n) => (
              <div key={n.id} onClick={() => !n.isRead && markRead(n.id)} style={{
                padding: "12px 18px", borderBottom: `1px solid ${colors.BORDER}`,
                background: n.isRead ? "transparent" : "rgba(201,168,76,0.04)",
                cursor: n.isRead ? "default" : "pointer", transition: "background 0.2s",
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = colors.NAVY2}
                onMouseLeave={(e) => e.currentTarget.style.background = n.isRead ? "transparent" : "rgba(201,168,76,0.04)"}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{typeIcons[n.type] || typeIcons.default}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, color: colors.LIGHT, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: n.isRead ? 500 : 600 }}>{n.title}</p>
                    <p style={{ margin: "3px 0 0", color: colors.MUTED, fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>{n.body}</p>
                    <p style={{ margin: "4px 0 0", color: colors.MUTED, fontFamily: "'DM Sans', sans-serif", fontSize: 10 }}>
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                    </p>
                  </div>
                  {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors.GOLD, flexShrink: 0, marginTop: 6 }} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
