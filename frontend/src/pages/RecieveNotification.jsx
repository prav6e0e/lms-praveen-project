import { useEffect, useState } from "react";
import axios from "axios";
import "./recievenotification.css";

function RecieveNotification() {
  const API = "http://127.0.0.1:8000";
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get user_id - fallback to 1 if not found
  const userId = localStorage.getItem("user_id") || "1";

  // 🔥 FETCH NOTIFICATIONS
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/notifications/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FETCH ON MOUNT + AUTO REFRESH EVERY 5 SECONDS
  useEffect(() => {
    fetchNotifications();

    // Auto-refresh notifications every 5 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div className="student-notification-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>🔔 My Notifications</h2>
        <button
          onClick={fetchNotifications}
          disabled={loading}
          style={{
            padding: "8px 16px",
            backgroundColor: "#7a4010",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "14px",
          }}
        >
          {loading ? "Refreshing..." : "🔄 Refresh"}
        </button>
      </div>

      {notifications.length === 0 ? (
        <p className="empty">No notifications yet</p>
      ) : (
        <div className="notification-list">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`notification-card ${n.is_read ? "read" : "unread"}`}
            >
              <h4>📢 {n.title}</h4>
              <p>{n.message}</p>

              <div className="meta">
                <span>📅 {new Date(n.created_at).toLocaleDateString()}</span>

                <span className={n.is_read ? "read-status" : "unread-status"}>
                  {n.is_read ? "Read" : "New"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecieveNotification;
